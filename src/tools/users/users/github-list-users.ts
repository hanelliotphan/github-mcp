import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUsersFailure, ListUsersSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllSinceLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubSinceLinkPagination } from "../../../utils/parse-github-link-header.js";

const DEFAULT_PER_PAGE = 100 as const;

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListUsersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_users",
        "List all users in signup order (GET /users). Pagination uses **`since`** (user id cursor) plus **`per_page`**, not `page`. " +
            "Set **`all_pages`** to follow `Link` next up to **`max_pages`** (default **100**). " +
            "See [List users](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10#list-users).",
        {
            since: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe("Only return users with an ID greater than this ID."),
            per_page: z.number().int().min(1).max(100).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllSinceLinkPages({
                        maxPages,
                        initialSince: input.since,
                        fetchChunk: async (since) => {
                            const response = await octokit.rest.users.list({
                                ...(since !== undefined ? { since } : {}),
                                per_page: perPage
                            });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const users = toPlainRows(result.rows);
                    const successPayload: ListUsersSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Users partially listed (${result.pagesFetched} pages, ${users.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Users listed successfully (${result.pagesFetched} pages, ${users.length} items).`
                              : "Users listed successfully.",
                        users,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        since: result.lastSinceUsed ?? null,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const response = await octokit.rest.users.list({
                    ...(input.since !== undefined ? { since: input.since } : {}),
                    per_page: perPage
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListUsersSuccess = {
                    success: true,
                    message: "Users listed successfully.",
                    users: toPlainRows(rows),
                    pagination: parseGitHubSinceLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    since: input.since ?? null,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUsersFailure = {
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
