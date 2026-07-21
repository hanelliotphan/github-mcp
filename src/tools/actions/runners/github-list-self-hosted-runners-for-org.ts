import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListSelfHostedRunnersForOrgFailure,
    ListSelfHostedRunnersForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "runners" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.runners) ? o.runners : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListSelfHostedRunnersForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_self_hosted_runners_for_org",
        "List self-hosted runners configured in an organization (GET /orgs/{org}/actions/runners). " +
            "Returns **`total_count`** and **`runners`**. Optionally filter by runner **`name`**. " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List self-hosted runners for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#list-self-hosted-runners-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().optional().describe("The name of a self-hosted runner to filter by."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const nameFilter = input.name ? { name: input.name } : {};
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.actions.listSelfHostedRunnersForOrg({
                                org: input.org,
                                ...nameFilter,
                                per_page: pp,
                                page
                            });
                            const parsed = parseBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                            }
                            return {
                                rows: parsed.rows,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const runners = toPlain(result.rows);
                    const successPayload: ListSelfHostedRunnersForOrgSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Runners partially listed (${result.pagesFetched} pages, ${runners.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Runners listed successfully (${result.pagesFetched} pages, ${runners.length} rows).`
                              : "Runners listed successfully.",
                        org: input.org,
                        total_count: firstTotalCount ?? runners.length,
                        runners,
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
                const response = await octokit.rest.actions.listSelfHostedRunnersForOrg({
                    org: input.org,
                    ...nameFilter,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListSelfHostedRunnersForOrgSuccess = {
                    success: true,
                    message: "Runners listed successfully.",
                    org: input.org,
                    total_count: parsed.total_count,
                    runners: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListSelfHostedRunnersForOrgFailure = {
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
