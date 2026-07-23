import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveRepoInteractionLimitsFailure,
    RemoveRepoInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveRepoInteractionLimitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_repo_interaction_limits",
        "Remove interaction restrictions from a repository (DELETE /repos/{owner}/{repo}/interaction-limits). " +
            "MCP **`name`** maps to API **`repo`**. Returns HTTP 204 on success; **409** if an organization-level limit is set for the owner. " +
            "See [Remove interaction restrictions for a repository](https://docs.github.com/en/rest/interactions/repos?apiVersion=2026-03-10#remove-interaction-restrictions-for-a-repository).",
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
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.interactions.removeRestrictionsForRepo({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveRepoInteractionLimitsSuccess = {
                    success: true,
                    message: "Repository interaction limits removed successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveRepoInteractionLimitsFailure = {
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
