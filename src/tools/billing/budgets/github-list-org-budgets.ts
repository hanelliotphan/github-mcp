import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgBudgetsFailure,
    ListOrgBudgetsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListOrgBudgetsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_budgets",
        "List all budgets for an organization (GET /organizations/{org}/settings/billing/budgets). " +
            "Requires organization admin or billing manager. Optional filters: **scope** and **user**. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `has_next_page` up to `max_pages` (default **100**). " +
            "See [Get all budgets for an organization](https://docs.github.com/en/rest/billing/budgets?apiVersion=2026-03-10#get-all-budgets-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            page: z.number().int().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            scope: z
                .enum(["enterprise", "organization", "repository", "cost_center", "multi_user_customer", "user"])
                .optional()
                .describe("Filter budgets by scope type."),
            user: z.string().min(1).optional().describe("Filter consumed amount details by user login."),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.scope ? { scope: input.scope } : {}),
                ...(input.user ? { user: input.user } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? 100;
                    const budgets: Record<string, unknown>[] = [];
                    let page = 1;
                    let pagesFetched = 0;
                    let lastRequestId: string | null = null;
                    let hasNext = true;
                    let truncated = false;
                    let totalCount: number | undefined;
                    let extra: Record<string, unknown> = {};
                    while (hasNext && pagesFetched < maxPages) {
                        const response = await octokit.request(
                            "GET /organizations/{org}/settings/billing/budgets",
                            { org: input.org, page, per_page: perPage, ...filters }
                        );
                        lastRequestId = getRequestId(response.headers["x-github-request-id"]);
                        const data = toPlain(response.data);
                        const rows = Array.isArray(data.budgets)
                            ? (data.budgets as Record<string, unknown>[])
                            : [];
                        budgets.push(...rows.map((r) => toPlain(r)));
                        if (pagesFetched === 0) {
                            const { budgets: _b, has_next_page: _h, total_count: _t, ...rest } = data;
                            extra = rest;
                            if (typeof data.total_count === "number") totalCount = data.total_count;
                        }
                        pagesFetched++;
                        hasNext = data.has_next_page === true;
                        if (hasNext) page += 1;
                    }
                    if (hasNext) truncated = true;
                    const successPayload: ListOrgBudgetsSuccess = {
                        success: true,
                        message: truncated
                            ? `Budgets partially listed (${pagesFetched} pages, ${budgets.length} rows); more pages exist.`
                            : pagesFetched > 1
                              ? `Budgets listed successfully (${pagesFetched} pages, ${budgets.length} rows).`
                              : "Budgets listed successfully.",
                        http_status: 200,
                        org: input.org,
                        budgets,
                        total_count: totalCount,
                        has_next_page: truncated ? true : false,
                        extra,
                        request_id: lastRequestId,
                        page,
                        per_page: perPage,
                        pages_fetched: pagesFetched,
                        truncated: truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const page = input.page ?? 1;
                const response = await octokit.request(
                    "GET /organizations/{org}/settings/billing/budgets",
                    { org: input.org, page, per_page: perPage, ...filters }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = toPlain(response.data);
                const budgets = Array.isArray(data.budgets)
                    ? (data.budgets as unknown[]).map((r) => toPlain(r))
                    : [];
                const { budgets: _b, ...rest } = data;
                const successPayload: ListOrgBudgetsSuccess = {
                    success: true,
                    message: "Budgets listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    budgets,
                    total_count: typeof data.total_count === "number" ? data.total_count : undefined,
                    has_next_page: data.has_next_page === true,
                    extra: rest,
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgBudgetsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
