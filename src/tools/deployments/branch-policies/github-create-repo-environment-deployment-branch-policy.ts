import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoEnvironmentDeploymentBranchPolicySuccess, CreateRepoEnvironmentDeploymentBranchPolicyFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubCreateRepoEnvironmentDeploymentBranchPolicyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_environment_deployment_branch_policy",
        "Create a deployment branch or tag policy for a repository environment (POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies). " +
            "MCP **`policy_name`** maps to API **`name`** (repo remains MCP **`name`**). Optional **`type`**: `branch` or `tag`. " +
            "Requires `deployment_branch_policy.custom_branch_policies` on the environment. Success is typically HTTP **200** (or **303** if the same pattern already exists). " +
            "See [Create a deployment branch policy](https://docs.github.com/en/rest/deployments/branch-policies?apiVersion=2026-03-10#create-a-deployment-branch-policy).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            environment_name: z.string().min(1).describe("The name of the environment."),
            policy_name: z.string().min(1).describe("The name pattern that branches or tags must match."),
            type: z.enum(["branch", "tag"]).optional().describe("Whether this rule applies to branch or tag names.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createDeploymentBranchPolicy({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                    name: input.policy_name,
                    ...(input.type !== undefined ? { type: input.type } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoEnvironmentDeploymentBranchPolicySuccess = {
                    success: true,
                    message: "Created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    environment_name: input.environment_name,
                    branch_policy: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoEnvironmentDeploymentBranchPolicyFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
