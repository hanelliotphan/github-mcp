import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    InstallationRequestItem,
    ListInstallationRequestsForAuthenticatedAppFailure,
    ListInstallationRequestsForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function parseRequestsBody(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "installation_requests" in data) {
        const o = data as Record<string, unknown>;
        return Array.isArray(o.installation_requests) ? o.installation_requests : [];
    }
    return [];
}

function toPlain(rows: unknown[]): InstallationRequestItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as InstallationRequestItem);
}

export function registerGithubListInstallationRequestsForAuthenticatedAppTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_installation_requests_for_authenticated_app",
        "List pending installation requests for the authenticated GitHub App (GET /app/installation-requests). " +
            "Typically requires authentication as a GitHub App (**JWT**). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List installation requests for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#list-installation-requests-for-the-authenticated-app).",
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
                            const response = await octokit.rest.apps.listInstallationRequestsForAuthenticatedApp({
                                per_page: pp,
                                page
                            });
                            return {
                                rows: parseRequestsBody(response.data),
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const installation_requests = toPlain(result.rows);
                    const successPayload: ListInstallationRequestsForAuthenticatedAppSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Installation requests partially listed (${result.pagesFetched} pages, ${installation_requests.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Installation requests listed successfully (${result.pagesFetched} pages, ${installation_requests.length} rows).`
                              : "Installation requests listed successfully.",
                        installation_requests,
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
                const response = await octokit.rest.apps.listInstallationRequestsForAuthenticatedApp({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const installation_requests = toPlain(parseRequestsBody(response.data));
                const successPayload: ListInstallationRequestsForAuthenticatedAppSuccess = {
                    success: true,
                    message: "Installation requests listed successfully.",
                    installation_requests,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListInstallationRequestsForAuthenticatedAppFailure = {
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
