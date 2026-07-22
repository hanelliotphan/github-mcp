import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListMarketplacePlansStubbedFailure,
    ListMarketplacePlansStubbedSuccess,
    MarketplaceListingPlanItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(rows: unknown[]): MarketplaceListingPlanItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as MarketplaceListingPlanItem);
}

export function registerGithubListMarketplacePlansStubbedTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_marketplace_plans_stubbed",
        "List Marketplace listing plans using **stubbed** test data (GET /marketplace_listing/stubbed/plans). " +
            "Same shape as the production counterpart; use for testing before listing on GitHub Marketplace. " +
            "Requires a **GitHub App JWT** or **OAuth app basic auth** (client id/secret). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List plans (stubbed)](https://docs.github.com/en/rest/apps/marketplace?apiVersion=2026-03-10#list-plans-stubbed).",
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
                            const response = await octokit.rest.apps.listPlansStubbed({
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
                    const plans = toPlain(result.rows);
                    const successPayload: ListMarketplacePlansStubbedSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Stubbed Marketplace plans partially listed (${result.pagesFetched} pages, ${plans.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Stubbed Marketplace plans listed successfully (${result.pagesFetched} pages, ${plans.length} rows).`
                              : "Stubbed Marketplace plans listed successfully.",
                        plans,
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
                const response = await octokit.rest.apps.listPlansStubbed({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const plans = toPlain(Array.isArray(response.data) ? response.data : []);
                const successPayload: ListMarketplacePlansStubbedSuccess = {
                    success: true,
                    message: "Stubbed Marketplace plans listed successfully.",
                    plans,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListMarketplacePlansStubbedFailure = {
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
