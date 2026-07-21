import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ActionsCacheItem,
    DeleteActionsCacheByKeyFailure,
    DeleteActionsCacheByKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "actions_caches" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.actions_caches) ? o.actions_caches : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

export function registerGithubDeleteActionsCacheByKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_actions_cache_by_key",
        "Delete GitHub Actions caches for a repository by key (DELETE /repos/{owner}/{repo}/actions/caches?key=). " +
            "Deletes one or more caches matching the given **`key`**, optionally scoped to a **`ref`**. " +
            "Returns the deleted caches (`total_count`, `actions_caches`). " +
            "Classic OAuth apps and PATs need the **`repo`** scope. " +
            "See [Delete GitHub Actions caches for a repository (using a cache key)](https://docs.github.com/en/rest/actions/cache?apiVersion=2026-03-10#delete-github-actions-caches-for-a-repository-using-a-cache-key).",
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
            key: z.string().min(1).describe("A key for identifying the cache."),
            ref: z
                .string()
                .min(1)
                .optional()
                .describe("Full git ref to scope the deletion, e.g. refs/heads/main or refs/pull/{number}/merge.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.deleteActionsCacheByKey({
                    owner: input.owner,
                    repo: input.name,
                    key: input.key,
                    ...(input.ref ? { ref: input.ref } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: DeleteActionsCacheByKeySuccess = {
                    success: true,
                    message: "Actions cache(s) deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    key: input.key,
                    ref: input.ref ?? null,
                    total_count: parsed.total_count,
                    actions_caches: parsed.rows.map(
                        (row) => JSON.parse(JSON.stringify(row)) as ActionsCacheItem
                    ),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteActionsCacheByKeyFailure = {
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
