import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListAuthenticatedUserEmailsFailure,
    ListAuthenticatedUserEmailsSuccess,
    UserEmailRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const DEFAULT_PER_PAGE = 100 as const;

function toPlainEmails(rows: unknown[]): UserEmailRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as UserEmailRow);
}

export function registerGithubListAuthenticatedUserEmailsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_authenticated_user_emails",
        "List **email addresses** for the authenticated user (GET /user/emails). Requires **`user:email`** scope on classic tokens. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "See [List email addresses for the authenticated user](https://docs.github.com/en/rest/users/emails?apiVersion=2026-03-10#list-email-addresses-for-the-authenticated-user).",
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
                            const response = await octokit.rest.users.listEmailsForAuthenticatedUser({
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
                    const emails = toPlainEmails(result.rows);
                    const successPayload: ListAuthenticatedUserEmailsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Emails partially listed (${result.pagesFetched} pages, ${emails.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Emails listed successfully (${result.pagesFetched} pages, ${emails.length} items).`
                              : "Emails listed successfully.",
                        http_status: 200,
                        emails,
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
                const response = await octokit.rest.users.listEmailsForAuthenticatedUser({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListAuthenticatedUserEmailsSuccess = {
                    success: true,
                    message: "Emails listed successfully.",
                    http_status: response.status,
                    emails: toPlainEmails(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAuthenticatedUserEmailsFailure = {
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
