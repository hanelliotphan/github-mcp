import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrganizationsFailure,
    ListOrganizationsSuccess,
    OrganizationSimpleListItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllSinceLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubSinceLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub’s API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainOrganizations(rows: unknown[]): OrganizationSimpleListItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrganizationSimpleListItem);
}

export function registerGithubListOrganizationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_organizations",
        "List all GitHub organizations in creation order (GET /organizations). " +
            "Returns **simple** organization objects (`login`, `id`, `url`, `avatar_url`, `description`, …). " +
            "Pagination uses **`since`** (numeric organization id cursor), not `page`. " +
            "The response includes **`since`**, **`pages_fetched`**, and **`pagination`** from the `Link` header—pass **`pagination.next.since`** on the next call when set. " +
            "**`per_page`** is 1–100 (default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "Unauthenticated requests are allowed; see [List organizations](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-organizations).",
        {
            since: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe("Only return organizations with an id greater than this value. Omit for the first page."),
            per_page: z.number().int().min(1).max(100).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllSinceLinkPages({
                        maxPages,
                        initialSince: input.since,
                        fetchChunk: async (since) => {
                            const response = await octokit.rest.orgs.list({
                                since,
                                per_page: perPage
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
                    const successPayload: ListOrganizationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organizations partially listed (${result.pagesFetched} chunks, ${organizations.length} orgs); more results exist.`
                            : result.pagesFetched > 1
                              ? `Organizations listed successfully (${result.pagesFetched} chunks, ${organizations.length} orgs).`
                              : "Organizations listed successfully.",
                        pagination: result.responsePagination,
                        organizations,
                        request_id: result.lastRequestId,
                        since: result.lastSinceUsed ?? null,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const response = await octokit.rest.orgs.list({
                    since: input.since,
                    per_page: perPage
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrganizationsSuccess = {
                    success: true,
                    message: "Organizations listed successfully.",
                    pagination: parseGitHubSinceLinkPagination(linkHeader),
                    organizations: toPlainOrganizations(rows),
                    request_id: requestId,
                    since: input.since ?? null,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrganizationsFailure = {
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
