import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListCommonlyUsedLicensesFailure,
    ListCommonlyUsedLicensesSuccess
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

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListCommonlyUsedLicensesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_commonly_used_licenses",
        "List the most commonly used licenses on GitHub (GET /licenses). Optional **`featured`** filter. " +
            "Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. " +
            "See [Get all commonly used licenses](https://docs.github.com/en/rest/licenses/licenses?apiVersion=2026-03-10#get-all-commonly-used-licenses).",
        {
            featured: z.boolean().optional().describe("When set, filters to featured licenses."),
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
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.licenses.getAllCommonlyUsed({
                                ...(input.featured !== undefined ? { featured: input.featured } : {}),
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
                    const licenses = toPlainRows(result.rows);
                    const successPayload: ListCommonlyUsedLicensesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Licenses partially listed (${result.pagesFetched} pages, ${licenses.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Licenses retrieved successfully (${result.pagesFetched} pages, ${licenses.length} items).`
                              : "Licenses retrieved successfully.",
                        licenses,
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
                const response = await octokit.rest.licenses.getAllCommonlyUsed({
                    ...(input.featured !== undefined ? { featured: input.featured } : {}),
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListCommonlyUsedLicensesSuccess = {
                    success: true,
                    message: "Licenses retrieved successfully.",
                    licenses: toPlainRows(rows),
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
                const failurePayload: ListCommonlyUsedLicensesFailure = {
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
