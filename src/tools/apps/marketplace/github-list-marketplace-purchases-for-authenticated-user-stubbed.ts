import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListMarketplacePurchasesForAuthenticatedUserStubbedFailure,
    ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess,
    UserMarketplacePurchaseItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(rows: unknown[]): UserMarketplacePurchaseItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as UserMarketplacePurchaseItem);
}

export function registerGithubListMarketplacePurchasesForAuthenticatedUserStubbedTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_marketplace_purchases_for_authenticated_user_stubbed",
        "List active Marketplace subscriptions for the authenticated user using **stubbed** test data " +
            "(GET /user/marketplace_purchases/stubbed). " +
            "Same shape as the production counterpart; use for testing. " +
            "Requires a **user access token**. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List subscriptions for the authenticated user (stubbed)](https://docs.github.com/en/rest/apps/marketplace?apiVersion=2026-03-10#list-subscriptions-for-the-authenticated-user-stubbed).",
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
                            const response =
                                await octokit.rest.apps.listSubscriptionsForAuthenticatedUserStubbed({
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
                    const purchases = toPlain(result.rows);
                    const successPayload: ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Stubbed Marketplace purchases partially listed (${result.pagesFetched} pages, ${purchases.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Stubbed Marketplace purchases listed successfully (${result.pagesFetched} pages, ${purchases.length} rows).`
                              : "Stubbed Marketplace purchases listed successfully.",
                        purchases,
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
                const response = await octokit.rest.apps.listSubscriptionsForAuthenticatedUserStubbed({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const purchases = toPlain(Array.isArray(response.data) ? response.data : []);
                const successPayload: ListMarketplacePurchasesForAuthenticatedUserStubbedSuccess = {
                    success: true,
                    message: "Stubbed Marketplace purchases listed successfully.",
                    purchases,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListMarketplacePurchasesForAuthenticatedUserStubbedFailure = {
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
