import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppInstallationItem,
    ListInstallationsForAuthenticatedAppFailure,
    ListInstallationsForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function parseInstallationsBody(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "installations" in data) {
        const o = data as Record<string, unknown>;
        return Array.isArray(o.installations) ? o.installations : [];
    }
    return [];
}

function toPlain(rows: unknown[]): AppInstallationItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as AppInstallationItem);
}

export function registerGithubListInstallationsForAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_installations_for_authenticated_app",
        "List installations for the authenticated GitHub App (GET /app/installations). " +
            "Permissions for each installation are under the **`permissions`** key. " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "Optional filters: **`since`** (ISO 8601), **`outdated`**. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List installations for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#list-installations-for-the-authenticated-app).",
        {
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            since: z
                .string()
                .min(1)
                .optional()
                .describe("Only show results last updated after this ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ)."),
            outdated: z.string().optional().describe("Filter for outdated installations (GitHub REST query param)."),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const filters = {
                    ...(input.since !== undefined ? { since: input.since } : {}),
                    ...(input.outdated !== undefined ? { outdated: input.outdated } : {})
                };
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.apps.listInstallations({
                                per_page: pp,
                                page,
                                ...filters
                            });
                            return {
                                rows: parseInstallationsBody(response.data),
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const installations = toPlain(result.rows);
                    const successPayload: ListInstallationsForAuthenticatedAppSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Installations partially listed (${result.pagesFetched} pages, ${installations.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Installations listed successfully (${result.pagesFetched} pages, ${installations.length} rows).`
                              : "Installations listed successfully.",
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
                const response = await octokit.rest.apps.listInstallations({
                    per_page: perPage,
                    page,
                    ...filters
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const installations = toPlain(parseInstallationsBody(response.data));
                const successPayload: ListInstallationsForAuthenticatedAppSuccess = {
                    success: true,
                    message: "Installations listed successfully.",
                    installations,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListInstallationsForAuthenticatedAppFailure = {
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
