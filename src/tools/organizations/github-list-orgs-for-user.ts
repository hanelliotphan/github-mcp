import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgsForUserFailure,
    ListOrgsForUserSuccess,
    OrganizationSimpleListItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub’s API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainOrganizations(rows: unknown[]): OrganizationSimpleListItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrganizationSimpleListItem);
}

export function registerGithubListOrgsForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_orgs_for_user",
        "List **public** organization memberships for a GitHub user (GET /users/{username}/orgs). " +
            "Returns the same **simple** organization objects as `github_list_organizations` (`login`, `id`, `url`, …). " +
            "**Private** memberships are not included; for the authenticated user’s full set use `github_list_orgs_for_authenticated_user`. " +
            "Works **without** authentication for public data. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "See [List organizations for a user](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations-for-a-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
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
                            const response = await octokit.rest.orgs.listForUser({
                                username: input.username,
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
                    const organizations = toPlainOrganizations(result.rows);
                    const successPayload: ListOrgsForUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organizations partially listed (${result.pagesFetched} pages, ${organizations.length} orgs); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organizations listed successfully (${result.pagesFetched} pages, ${organizations.length} orgs).`
                              : "Organizations for user listed successfully.",
                        username: input.username,
                        organizations,
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
                const response = await octokit.rest.orgs.listForUser({
                    username: input.username,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgsForUserSuccess = {
                    success: true,
                    message: "Organizations for user listed successfully.",
                    username: input.username,
                    organizations: toPlainOrganizations(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgsForUserFailure = {
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
