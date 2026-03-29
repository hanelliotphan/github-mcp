import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListPublicReposFailure, ListPublicReposSuccess, PublicRepoListItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllSinceLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubSinceLinkPagination } from "../../utils/parse-github-link-header.js";

function normalizePublicRepo(row: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    fork: boolean;
    default_branch: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
    owner: { login: string } | null;
}): PublicRepoListItem {
    return {
        id: row.id,
        name: row.name,
        full_name: row.full_name,
        owner_login: row.owner?.login ?? "",
        private: row.private,
        html_url: row.html_url,
        description: row.description,
        fork: row.fork,
        default_branch: row.default_branch,
        created_at: row.created_at,
        updated_at: row.updated_at,
        pushed_at: row.pushed_at
    };
}

function mapRows(rows: unknown[]): PublicRepoListItem[] {
    return rows.map((row) =>
        normalizePublicRepo(
            row as {
                id: number;
                name: string;
                full_name: string;
                description: string | null;
                private: boolean;
                html_url: string;
                fork: boolean;
                default_branch: string | null;
                created_at: string | null;
                updated_at: string | null;
                pushed_at: string | null;
                owner: { login: string } | null;
            }
        )
    );
}

export function registerGithubListPublicReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_public_repos",
        "List all public repositories on GitHub in creation order (GET /repositories). " +
            "Pagination uses the `since` query parameter (repository id cursor), not page/per_page. " +
            "The response includes `since`, `pages_fetched`, and `pagination` from the `Link` header—pass `next.since` on the next call when `pagination.next` is set. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next.since` or increase `max_pages`.",
        {
            since: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe(
                    "Only return repositories with an id greater than this value. Omit for the first page."
                ),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllSinceLinkPages({
                        maxPages,
                        initialSince: input.since,
                        fetchChunk: async (since) => {
                            const response = await octokit.rest.repos.listPublic({ since });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const repositories = mapRows(result.rows);
                    const successPayload: ListPublicReposSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Public repositories partially listed (${result.pagesFetched} chunks, ${repositories.length} repos); more results exist.`
                            : result.pagesFetched > 1
                              ? `Public repositories listed successfully (${result.pagesFetched} chunks, ${repositories.length} repos).`
                              : "Public repositories listed successfully.",
                        pagination: result.responsePagination,
                        repositories,
                        request_id: result.lastRequestId,
                        since: result.lastSinceUsed ?? null,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const response = await octokit.rest.repos.listPublic({
                    since: input.since
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListPublicReposSuccess = {
                    success: true,
                    message: "Public repositories listed successfully.",
                    pagination: parseGitHubSinceLinkPagination(linkHeader),
                    repositories: mapRows(rows),
                    request_id: requestId,
                    since: input.since ?? null,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListPublicReposFailure = {
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
