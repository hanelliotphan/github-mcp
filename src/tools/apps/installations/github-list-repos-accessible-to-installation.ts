import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    InstallationRepositoryItem,
    ListReposAccessibleToInstallationFailure,
    ListReposAccessibleToInstallationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub's API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

function parseRepositoriesBody(data: unknown): {
    total_count: number;
    repositories: unknown[];
    repository_selection?: string;
} {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        const repositories = Array.isArray(o.repositories) ? o.repositories : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : repositories.length;
        return {
            total_count,
            repositories,
            ...(typeof o.repository_selection === "string"
                ? { repository_selection: o.repository_selection }
                : {})
        };
    }
    return { total_count: 0, repositories: [] };
}

function toPlain(rows: unknown[]): InstallationRepositoryItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as InstallationRepositoryItem);
}

export function registerGithubListReposAccessibleToInstallationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repos_accessible_to_installation",
        "List repositories accessible to the app installation (GET /installation/repositories). " +
            "Returns **`total_count`** and **`repositories`** (and optional **`repository_selection`**). " +
            "You must authenticate with an **installation access token** (not a JWT or user PAT). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List repositories accessible to the app installation](https://docs.github.com/en/rest/apps/installations?apiVersion=2026-03-10#list-repositories-accessible-to-the-app-installation).",
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
                    let firstRepositorySelection: string | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.apps.listReposAccessibleToInstallation({
                                per_page: pp,
                                page
                            });
                            const parsed = parseRepositoriesBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                                firstRepositorySelection = parsed.repository_selection;
                            }
                            return {
                                rows: parsed.repositories,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const repositories = toPlain(result.rows);
                    const successPayload: ListReposAccessibleToInstallationSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repositories partially listed (${result.pagesFetched} pages, ${repositories.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repositories listed successfully (${result.pagesFetched} pages, ${repositories.length} rows).`
                              : "Repositories listed successfully.",
                        total_count: firstTotalCount ?? repositories.length,
                        repositories,
                        ...(firstRepositorySelection !== undefined
                            ? { repository_selection: firstRepositorySelection }
                            : {}),
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
                const response = await octokit.rest.apps.listReposAccessibleToInstallation({
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const parsed = parseRepositoriesBody(response.data);
                const successPayload: ListReposAccessibleToInstallationSuccess = {
                    success: true,
                    message: "Repositories listed successfully.",
                    total_count: parsed.total_count,
                    repositories: toPlain(parsed.repositories),
                    ...(parsed.repository_selection !== undefined
                        ? { repository_selection: parsed.repository_selection }
                        : {}),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListReposAccessibleToInstallationFailure = {
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
