import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateOrUpdateRepoEnvironmentSuccess, CreateOrUpdateRepoEnvironmentFailure } from "../../../types.js";
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

export function registerGithubCreateOrUpdateRepoEnvironmentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_or_update_repo_environment",
        "Create or update an environment for a repository. See [Create or update an environment](https://docs.github.com/en/rest/deployments/environments?apiVersion=2026-03-10#create-or-update-an-environment).",
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
            wait_timer: z.number().int().min(0).max(43200).optional().describe("Wait timer in minutes before deployment can proceed."),
            prevent_self_review: z.boolean().optional().describe("Whether users who triggered a deployment cannot approve it."),
            reviewers: z
                .array(
                    z.object({
                        type: z.enum(["User", "Team"]),
                        id: z.number().int().positive()
                    })
                )
                .optional()
                .describe("Users or teams that may review deployments to this environment."),
            deployment_branch_policy: z
                .union([
                    z.object({
                        protected_branches: z.boolean(),
                        custom_branch_policies: z.boolean()
                    }),
                    z.null()
                ])
                .optional()
                .describe("Branch policy settings for the environment, or null to disable.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createOrUpdateEnvironment({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                    ...(input.wait_timer !== undefined ? { wait_timer: input.wait_timer } : {}),
                    ...(input.prevent_self_review !== undefined ? { prevent_self_review: input.prevent_self_review } : {}),
                    ...(input.reviewers !== undefined ? { reviewers: input.reviewers } : {}),
                    ...(input.deployment_branch_policy !== undefined ? { deployment_branch_policy: input.deployment_branch_policy } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrUpdateRepoEnvironmentSuccess = {
                    success: true,
                    message: "Updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    environment_name: input.environment_name,
                    environment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrUpdateRepoEnvironmentFailure = {
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
