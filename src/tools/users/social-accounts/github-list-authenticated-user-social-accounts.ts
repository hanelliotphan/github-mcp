import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListAuthenticatedUserSocialAccountsFailure, ListAuthenticatedUserSocialAccountsSuccess, UserSocialAccountRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; GitHub's REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRows(rows: unknown[]): UserSocialAccountRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as UserSocialAccountRow);
}

export function registerGithubListAuthenticatedUserSocialAccountsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_authenticated_user_social_accounts",
        "List social accounts for the authenticated user (GET /user/social_accounts). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "See [List social accounts for the authenticated user (GET /user/social_accounts).](https://docs.github.com/en/rest/users/social-accounts?apiVersion=2026-03-10#list-social-accounts-for-the-authenticated-user).",
        {
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.users.listSocialAccountsForAuthenticatedUser({ per_page: pp, page });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const social_accounts = toPlainRows(result.rows);
                    const successPayload: ListAuthenticatedUserSocialAccountsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Items partially listed (${result.pagesFetched} pages, ${social_accounts.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Items listed successfully (${result.pagesFetched} pages, ${social_accounts.length} items).`
                              : "Items listed successfully.",
                        http_status: 200,
                        
                        social_accounts,
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
                const response = await octokit.rest.users.listSocialAccountsForAuthenticatedUser({ per_page: perPage, page });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListAuthenticatedUserSocialAccountsSuccess = {
                    success: true,
                    message: "Items listed successfully.",
                    http_status: response.status,
                    
                    social_accounts: toPlainRows(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAuthenticatedUserSocialAccountsFailure = {
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
