import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgsForAuthenticatedUserFailure,
    ListOrgsForAuthenticatedUserSuccess,
    OrganizationSimpleListItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub’s API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainOrganizations(rows: unknown[]): OrganizationSimpleListItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrganizationSimpleListItem);
}

export function registerGithubListOrgsForAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_orgs_for_authenticated_user",
        "List organizations the authenticated token may operate on (GET /user/orgs). " +
            "Same **simple** organization objects as `github_list_organizations` (`login`, `id`, `url`, …). " +
            "Classic PATs need at least **`user`** or **`read:org`**; insufficient scope yields **403**. " +
            "**Fine-grained** tokens can return **200** with an **empty** list per GitHub. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Responses include **`page`**, **`per_page`**, **`pages_fetched`**, and **`pagination`** from the `Link` header. " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "See [List organizations for the authenticated user](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations-for-the-authenticated-user).",
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
                            const response = await octokit.rest.orgs.listForAuthenticatedUser({
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
                    const successPayload: ListOrgsForAuthenticatedUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organizations partially listed (${result.pagesFetched} pages, ${organizations.length} orgs); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organizations listed successfully (${result.pagesFetched} pages, ${organizations.length} orgs).`
                              : "Organizations for the authenticated user listed successfully.",
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
                const response = await octokit.rest.orgs.listForAuthenticatedUser({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgsForAuthenticatedUserSuccess = {
                    success: true,
                    message: "Organizations for the authenticated user listed successfully.",
                    organizations: toPlainOrganizations(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgsForAuthenticatedUserFailure = {
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
