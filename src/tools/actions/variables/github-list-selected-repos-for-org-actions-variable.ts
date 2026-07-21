import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListSelectedReposForOrgActionsVariableFailure,
    ListSelectedReposForOrgActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

const DEFAULT_PER_PAGE = 30 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.repositories) ? o.repositories : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListSelectedReposForOrgActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_selected_repos_for_org_actions_variable",
        "List repositories that can access an organization variable whose visibility is `selected` (GET /orgs/{org}/actions/variables/{name}/repositories). " +
            "Returns **`total_count`** and **`repositories`**. Returns HTTP **409** if the variable visibility is not `selected`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). " +
            "Use `per_page` (1–100, default **30** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List selected repositories for an organization variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#list-selected-repositories-for-an-organization-variable).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .regex(variableNameRegex, "name may only contain letters, numbers, and underscores and cannot start with a number"),
            per_page: z.number().int().min(1).max(100).optional(),
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
                            const response = await octokit.rest.actions.listSelectedReposForOrgVariable({
                                org: input.org,
                                name: input.name,
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
                    const repositories = toPlain(result.rows);
                    const successPayload: ListSelectedReposForOrgActionsVariableSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Selected repositories partially listed (${result.pagesFetched} pages, ${repositories.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Selected repositories listed successfully (${result.pagesFetched} pages, ${repositories.length} rows).`
                              : "Selected repositories listed successfully.",
                        org: input.org,
                        variable_name: input.name,
                        total_count: firstTotalCount ?? repositories.length,
                        repositories,
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
                const response = await octokit.rest.actions.listSelectedReposForOrgVariable({
                    org: input.org,
                    name: input.name,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListSelectedReposForOrgActionsVariableSuccess = {
                    success: true,
                    message: "Selected repositories listed successfully.",
                    org: input.org,
                    variable_name: input.name,
                    total_count: parsed.total_count,
                    repositories: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListSelectedReposForOrgActionsVariableFailure = {
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
