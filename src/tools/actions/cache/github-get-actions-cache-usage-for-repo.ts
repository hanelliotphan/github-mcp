import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ActionsCacheUsageForRepo,
    GetActionsCacheUsageForRepoFailure,
    GetActionsCacheUsageForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainUsage(data: unknown): ActionsCacheUsageForRepo {
    return JSON.parse(JSON.stringify(data)) as ActionsCacheUsageForRepo;
}

export function registerGithubGetActionsCacheUsageForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_actions_cache_usage_for_repo",
        "Get GitHub Actions cache usage for a repository (GET /repos/{owner}/{repo}/actions/cache/usage). " +
            "Returns `full_name`, `active_caches_size_in_bytes`, and `active_caches_count`. " +
            "Anyone with **read** access can use this; classic tokens need **`repo`** scope for private repositories. " +
            "See [Get GitHub Actions cache usage for a repository](https://docs.github.com/en/rest/actions/cache?apiVersion=2026-03-10#get-github-actions-cache-usage-for-a-repository).",
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
                const response = await octokit.rest.actions.getActionsCacheUsage({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetActionsCacheUsageForRepoSuccess = {
                    success: true,
                    message: "Actions cache usage retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    usage: toPlainUsage(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetActionsCacheUsageForRepoFailure = {
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
