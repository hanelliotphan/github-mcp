import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SearchIssuesSuccess,
    SearchIssuesFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import {
    getLinkHeaderFromResponse,
    parseGitHubPageLinkPagination
} from "../../../utils/parse-github-link-header.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

function parseSearchBody(data: unknown): {
    total_count: number;
    incomplete_results: boolean;
    items: unknown[];
} {
    if (data === null || typeof data !== "object") {
        return { total_count: 0, incomplete_results: false, items: [] };
    }
    const o = data as {
        total_count?: unknown;
        incomplete_results?: unknown;
        items?: unknown;
    };
    return {
        total_count: typeof o.total_count === "number" ? o.total_count : 0,
        incomplete_results: o.incomplete_results === true,
        items: Array.isArray(o.items) ? o.items : []
    };
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubSearchIssuesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_search_issues",
        "Search issues and pull requests (GET /search/issues). " +
            "Optional **`advanced_search`**, **`search_type`** (`semantic` / `hybrid`). " +
            "Requires **`q`**. Optional **`text_match`** requests text-match highlight metadata. " +
            "Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`** (GitHub search returns at most **1,000** results). " +
            "`per_page` defaults to **100** when omitted (GitHub max **100**). " +
            "See [Search issues and pull requests](https://docs.github.com/en/rest/search/search?apiVersion=2026-03-10#search-issues-and-pull-requests).",
        {
            sort: z
                .enum([
                    "comments",
                    "reactions",
                    "reactions-+1",
                    "reactions--1",
                    "reactions-smile",
                    "reactions-thinking_face",
                    "reactions-heart",
                    "reactions-tada",
                    "interactions",
                    "created",
                    "updated"
                ])
                .optional(),
            order: z.enum(["desc", "asc"]).optional(),
            advanced_search: z
                .string()
                .optional()
                .describe('Set to "true" to use advanced search'),
            search_type: z
                .enum(["semantic", "hybrid"])
                .optional()
                .describe("Semantic/hybrid search (issues only; rate limited)"),
            q: z.string().min(1),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional(),
            text_match: z
                .boolean()
                .optional()
                .describe("When true, request text-match highlight metadata (Accept: text-match)")
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const mediaType =
                input.text_match === true ? { format: "text-match" as const } : undefined;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let totalCount = 0;
                    let incomplete = false;
                    let sawFirst = false;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.search.issuesAndPullRequests({
                                q: input.q,
                                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                                ...(input.order !== undefined ? { order: input.order } : {}),
                                ...(input.advanced_search !== undefined
                                    ? { advanced_search: input.advanced_search }
                                    : {}),
                                ...(input.search_type !== undefined
                                    ? { search_type: input.search_type }
                                    : {}),
                                per_page: pp,
                                page,
                                ...(mediaType !== undefined ? { mediaType } : {})
                            } as never);
                            const parsed = parseSearchBody(response.data);
                            if (!sawFirst) {
                                totalCount = parsed.total_count;
                                sawFirst = true;
                            }
                            if (parsed.incomplete_results) {
                                incomplete = true;
                            }
                            return {
                                rows: parsed.items,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const items = toPlainRows(result.rows);
                    const successPayload: SearchIssuesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Issue search results partially listed (${result.pagesFetched} pages, ${items.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Issue search results retrieved successfully (${result.pagesFetched} pages, ${items.length} items).`
                              : "Issue search results retrieved successfully.",
                        q: input.q,
                        total_count: totalCount,
                        incomplete_results: incomplete,
                        items,
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
                const response = await octokit.rest.search.issuesAndPullRequests({
                                q: input.q,
                                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                                ...(input.order !== undefined ? { order: input.order } : {}),
                                ...(input.advanced_search !== undefined
                                    ? { advanced_search: input.advanced_search }
                                    : {}),
                                ...(input.search_type !== undefined
                                    ? { search_type: input.search_type }
                                    : {}),
                    per_page: perPage,
                    page,
                    ...(mediaType !== undefined ? { mediaType } : {})
                } as never);
                const parsed = parseSearchBody(response.data);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SearchIssuesSuccess = {
                    success: true,
                    message: "Issue search results retrieved successfully.",
                    q: input.q,
                    total_count: parsed.total_count,
                    incomplete_results: parsed.incomplete_results,
                    items: toPlainRows(parsed.items),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SearchIssuesFailure = {
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
