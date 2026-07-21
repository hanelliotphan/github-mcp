import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteActionsCacheByIdFailure,
    DeleteActionsCacheByIdSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteActionsCacheByIdTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_actions_cache_by_id",
        "Delete a GitHub Actions cache for a repository by id (DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}). " +
            "Use **`cache_id`** from `github_list_actions_caches`. Classic OAuth apps and PATs need the **`repo`** scope. Success is HTTP **204** No Content. " +
            "See [Delete a GitHub Actions cache for a repository (using a cache ID)](https://docs.github.com/en/rest/actions/cache?apiVersion=2026-03-10#delete-a-github-actions-cache-for-a-repository-using-a-cache-id).",
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
            cache_id: z.number().int().positive().describe("The unique identifier of the GitHub Actions cache.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.deleteActionsCacheById({
                    owner: input.owner,
                    repo: input.name,
                    cache_id: input.cache_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteActionsCacheByIdSuccess = {
                    success: true,
                    message: "Actions cache deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    cache_id: input.cache_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteActionsCacheByIdFailure = {
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
