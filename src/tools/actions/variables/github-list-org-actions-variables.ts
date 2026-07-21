import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgActionsVariablesFailure,
    ListOrgActionsVariablesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 30 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "variables" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.variables) ? o.variables : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListOrgActionsVariablesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_actions_variables",
        "List GitHub Actions variables in an organization (GET /orgs/{org}/actions/variables). " +
            "Returns **`total_count`** and **`variables`** (name, value, timestamps, visibility). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). " +
            "Use `per_page` (1–30, default **30** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List organization variables](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#list-organization-variables).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            per_page: z.number().int().min(1).max(30).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.actions.listOrgVariables({
                                org: input.org,
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
                    const variables = toPlain(result.rows);
                    const successPayload: ListOrgActionsVariablesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization variables partially listed (${result.pagesFetched} pages, ${variables.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization variables listed successfully (${result.pagesFetched} pages, ${variables.length} rows).`
                              : "Organization variables listed successfully.",
                        org: input.org,
                        total_count: firstTotalCount ?? variables.length,
                        variables,
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
                const response = await octokit.rest.actions.listOrgVariables({
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListOrgActionsVariablesSuccess = {
                    success: true,
                    message: "Organization variables listed successfully.",
                    org: input.org,
                    total_count: parsed.total_count,
                    variables: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgActionsVariablesFailure = {
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
