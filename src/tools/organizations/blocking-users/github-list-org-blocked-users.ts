import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgBlockedUsersFailure,
    ListOrgBlockedUsersSuccess,
    OrgBlockedUserRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainBlockedUsers(rows: unknown[]): OrgBlockedUserRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgBlockedUserRow);
}

export function registerGithubListOrgBlockedUsersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_blocked_users",
        "List **users blocked** by an organization (GET /orgs/{org}/blocks). Returns **simple user** objects per GitHub. " +
            "Requires **`admin:org`** on classic tokens; without it GitHub returns **404**. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "See [List users blocked by an organization](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10#list-users-blocked-by-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
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
                            const response = await octokit.rest.orgs.listBlockedUsers({
                                org: input.org,
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
                    const blocked_users = toPlainBlockedUsers(result.rows);
                    const successPayload: ListOrgBlockedUsersSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Blocked users partially listed (${result.pagesFetched} pages, ${blocked_users.length} users); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Blocked users listed successfully (${result.pagesFetched} pages, ${blocked_users.length} users).`
                              : "Blocked users listed successfully.",
                        http_status: 200,
                        org: input.org,
                        blocked_users,
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
                const response = await octokit.rest.orgs.listBlockedUsers({
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgBlockedUsersSuccess = {
                    success: true,
                    message: "Blocked users listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    blocked_users: toPlainBlockedUsers(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgBlockedUsersFailure = {
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
