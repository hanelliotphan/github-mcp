import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoEnvironmentDeploymentBranchPolicySuccess, DeleteRepoEnvironmentDeploymentBranchPolicyFailure } from "../../../types.js";
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

export function registerGithubDeleteRepoEnvironmentDeploymentBranchPolicyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_environment_deployment_branch_policy",
        "Delete a deployment branch policy from a repository environment. Success is HTTP **204**. See [Delete a deployment branch policy](https://docs.github.com/en/rest/deployments/branch-policies?apiVersion=2026-03-10#delete-a-deployment-branch-policy).",
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
            branch_policy_id: z.number().int().positive().describe("The unique identifier of the branch policy.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.deleteDeploymentBranchPolicy({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                    branch_policy_id: input.branch_policy_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoEnvironmentDeploymentBranchPolicySuccess = {
                    success: true,
                    message: "Deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    environment_name: input.environment_name,
                    branch_policy_id: input.branch_policy_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoEnvironmentDeploymentBranchPolicyFailure = {
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
