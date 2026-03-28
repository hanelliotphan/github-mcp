import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoFailure, DeleteRepoSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

// Repository name (same constraints as create tools).
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

// Owner is either a user login or an organization login (GitHub-style).
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo",
        "Permanently delete a GitHub repository. Uses DELETE /repos/{owner}/{repo} (same call for personal or org owners). Requires admin access and delete_repo scope for classic PATs. Live deletes require confirm: true unless dry_run is true.",
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
            dry_run: z.boolean().optional().default(false),
            confirm: z.boolean().optional().default(false)
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            const planned = { owner: input.owner, repo: input.name, full_name };

            if (input.dry_run) {
                const dryRunResponse: DeleteRepoSuccess = {
                    success: true,
                    message: "Dry run successful. Repository was not deleted.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: null,
                    dry_run: true,
                    planned_request: planned
                };
                return textAndData(dryRunResponse);
            }

            if (!input.confirm) {
                const guardFailure: DeleteRepoFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message:
                            "Refusing to delete: set confirm to true after verifying owner and name, or use dry_run: true to preview.",
                        hint: "Example: same arguments with confirm: true to execute DELETE.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(guardFailure);
            }

            try {
                const response = await octokit.rest.repos.delete({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: DeleteRepoSuccess = {
                    success: true,
                    message: "Repository deleted successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
