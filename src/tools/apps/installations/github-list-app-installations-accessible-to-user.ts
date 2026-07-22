import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppInstallationItem,
    ListAppInstallationsAccessibleToUserFailure,
    ListAppInstallationsAccessibleToUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function parseInstallationsBody(data: unknown): { total_count: number; installations: unknown[] } {
    if (data && typeof data === "object" && "installations" in data) {
        const o = data as Record<string, unknown>;
        const installations = Array.isArray(o.installations) ? o.installations : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : installations.length;
        return { total_count, installations };
    }
    return { total_count: 0, installations: [] };
}

function toPlain(rows: unknown[]): AppInstallationItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as AppInstallationItem);
}

export function registerGithubListAppInstallationsAccessibleToUserTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_app_installations_accessible_to_user",
        "List GitHub App installations accessible to the authenticated user (GET /user/installations). " +
            "Returns **`total_count`** and **`installations`** (permissions under each installation's **`permissions`** key). " +
            "Lists installations of your GitHub App that the user has explicit **:read**, **:write**, or **:admin** permission to access. " +
            "You must authenticate with a **user access token** (not an installation token or JWT). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List app installations accessible to the user access token](https://docs.github.com/en/rest/apps/installations?apiVersion=2026-03-10#list-app-installations-accessible-to-the-user-access-token).",
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
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.apps.listInstallationsForAuthenticatedUser({
                                per_page: pp,
                                page
                            });
                            const parsed = parseInstallationsBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                            }
                            return {
                                rows: parsed.installations,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const installations = toPlain(result.rows);
                    const successPayload: ListAppInstallationsAccessibleToUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Installations partially listed (${result.pagesFetched} pages, ${installations.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Installations listed successfully (${result.pagesFetched} pages, ${installations.length} rows).`
                              : "Installations listed successfully.",
                        total_count: firstTotalCount ?? installations.length,
                        installations,
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
                const response = await octokit.rest.apps.listInstallationsForAuthenticatedUser({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const parsed = parseInstallationsBody(response.data);
                const successPayload: ListAppInstallationsAccessibleToUserSuccess = {
                    success: true,
                    message: "Installations listed successfully.",
                    total_count: parsed.total_count,
                    installations: toPlain(parsed.installations),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAppInstallationsAccessibleToUserFailure = {
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
