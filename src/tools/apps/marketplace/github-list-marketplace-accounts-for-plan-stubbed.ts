import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListMarketplaceAccountsForPlanStubbedFailure,
    ListMarketplaceAccountsForPlanStubbedSuccess,
    MarketplacePurchaseAccountItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(rows: unknown[]): MarketplacePurchaseAccountItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as MarketplacePurchaseAccountItem);
}

export function registerGithubListMarketplaceAccountsForPlanStubbedTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_marketplace_accounts_for_plan_stubbed",
        "List accounts for a Marketplace plan using **stubbed** test data " +
            "(GET /marketplace_listing/stubbed/plans/{plan_id}/accounts). " +
            "Same shape as the production counterpart; use for testing before listing on GitHub Marketplace. " +
            "Optional **`sort`** = `created` (default) or `updated`; **`direction`** = `asc` or `desc` (ignored without `sort`). " +
            "Requires a **GitHub App JWT** or **OAuth app basic auth** (client id/secret). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List accounts for a plan (stubbed)](https://docs.github.com/en/rest/apps/marketplace?apiVersion=2026-03-10#list-accounts-for-a-plan-stubbed).",
        {
            plan_id: z.number().int().describe("The unique identifier of the plan."),
            sort: z
                .enum(["created", "updated"])
                .optional()
                .describe("Property to sort by (`created` default, or `updated`)."),
            direction: z
                .enum(["asc", "desc"])
                .optional()
                .describe("Sort direction (`asc` / `desc`). Ignored without the sort parameter."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const filters = {
                    ...(input.sort !== undefined ? { sort: input.sort } : {}),
                    ...(input.direction !== undefined ? { direction: input.direction } : {})
                };
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.apps.listAccountsForPlanStubbed({
                                plan_id: input.plan_id,
                                per_page: pp,
                                page,
                                ...filters
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
                    const accounts = toPlain(result.rows);
                    const successPayload: ListMarketplaceAccountsForPlanStubbedSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Stubbed Marketplace accounts partially listed (${result.pagesFetched} pages, ${accounts.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Stubbed Marketplace accounts listed successfully (${result.pagesFetched} pages, ${accounts.length} rows).`
                              : "Stubbed Marketplace accounts listed successfully.",
                        plan_id: input.plan_id,
                        accounts,
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
                const response = await octokit.rest.apps.listAccountsForPlanStubbed({
                    plan_id: input.plan_id,
                    per_page: perPage,
                    page,
                    ...filters
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const accounts = toPlain(Array.isArray(response.data) ? response.data : []);
                const successPayload: ListMarketplaceAccountsForPlanStubbedSuccess = {
                    success: true,
                    message: "Stubbed Marketplace accounts listed successfully.",
                    plan_id: input.plan_id,
                    accounts,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListMarketplaceAccountsForPlanStubbedFailure = {
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
