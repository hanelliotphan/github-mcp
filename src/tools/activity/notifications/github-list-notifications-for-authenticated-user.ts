import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListNotificationsForAuthenticatedUserFailure,
    ListNotificationsForAuthenticatedUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const DEFAULT_PER_PAGE = 50 as const;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListNotificationsForAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_notifications_for_authenticated_user",
        "List all notifications (threads) for the authenticated user, sorted by most recently updated (GET /notifications). " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Filters: **`all`** (include read), **`participating`** (only participating/mentioned), " +
            "**`since`** and **`before`** (ISO 8601 timestamps). Use `per_page` (1–50, default **50** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List notifications for the authenticated user](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#list-notifications-for-the-authenticated-user).",
        {
            all: z.boolean().optional().describe("If true, show notifications marked as read (default false)."),
            participating: z.boolean().optional().describe("If true, only show notifications where the user is directly participating or mentioned (default false)."),
            since: z.string().optional().describe("Only show results updated after this ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ)."),
            before: z.string().optional().describe("Only show notifications updated before this ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ)."),
            per_page: z.number().int().min(1).max(50).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.all !== undefined ? { all: input.all } : {}),
                ...(input.participating !== undefined ? { participating: input.participating } : {}),
                ...(input.since ? { since: input.since } : {}),
                ...(input.before ? { before: input.before } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.activity.listNotificationsForAuthenticatedUser({
                                ...filters,
                                per_page: pp,
                                page
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
                    const notifications = toPlain(result.rows);
                    const successPayload: ListNotificationsForAuthenticatedUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Notifications partially listed (${result.pagesFetched} pages, ${notifications.length} threads); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Notifications listed successfully (${result.pagesFetched} pages, ${notifications.length} threads).`
                              : "Notifications listed successfully.",
                        notifications,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        page: result.lastPage,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const page = input.page ?? 1;
                const response = await octokit.rest.activity.listNotificationsForAuthenticatedUser({
                    ...filters,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListNotificationsForAuthenticatedUserSuccess = {
                    success: true,
                    message: "Notifications listed successfully.",
                    notifications: toPlain(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListNotificationsForAuthenticatedUserFailure = {
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
