import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserAccountIssuesSuccess, ListUserAccountIssuesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;


export function registerGithubListUserAccountIssuesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_account_issues",
        "List issues for the authenticated user across owned and member repositories (GET /user/issues). Page pagination. See [List user account issues](https://docs.github.com/en/rest/issues/issues?apiVersion=2026-03-10#list-user-account-issues).",
        {
            filter: z.enum(["assigned", "created", "mentioned", "subscribed", "repos", "all"]).optional(),
            state: z.enum(["open", "closed", "all"]).optional(),
            labels: z.string().optional(),
            sort: z.enum(["created", "updated", "comments"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            since: z.string().optional(),            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const filters = {
                ...(input.filter !== undefined ? { filter: input.filter } : {}),
                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.labels !== undefined ? { labels: input.labels } : {}),
                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                ...(input.since !== undefined ? { since: input.since } : {}),
            };
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.issues.listForAuthenticatedUser({...filters, per_page: pp, page });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const issues = toPlainRows(result.rows);
                    const successPayload: ListUserAccountIssuesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `User account issues partially listed (${result.pagesFetched} pages, ${issues.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `User account issues retrieved successfully (${result.pagesFetched} pages, ${issues.length} items).`
                              : "User account issues retrieved successfully.",
                        issues,
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
                const response = await octokit.rest.issues.listForAuthenticatedUser({...filters, per_page: perPage, page });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListUserAccountIssuesSuccess = {
                    success: true,
                    message: "User account issues retrieved successfully.",
                    issues: toPlainRows(rows),
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
                const failurePayload: ListUserAccountIssuesFailure = {
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
