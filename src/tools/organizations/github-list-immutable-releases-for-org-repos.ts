import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListImmutableReleasesForOrgReposFailure,
    ListImmutableReleasesForOrgReposSuccess,
    OrgImmutableReleasesRepositoryItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub’s API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseRepositoriesBody(data: unknown): { total_count: number; repositories: unknown[] } {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        const repositories = Array.isArray(o.repositories) ? o.repositories : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : repositories.length;
        return { total_count, repositories };
    }
    return { total_count: 0, repositories: [] };
}

function toPlainRepositories(rows: unknown[]): OrgImmutableReleasesRepositoryItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgImmutableReleasesRepositoryItem);
}

export function registerGithubListImmutableReleasesForOrgReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_immutable_releases_for_org_repos",
        "List repositories selected for organization immutable releases enforcement (GET /orgs/{org}/settings/immutable-releases/repositories). " +
            "Only applies when org policy uses **`selected`** (see `github_get_org_immutable_releases_settings`). " +
            "OAuth and classic personal access tokens typically need **`admin:org`** per GitHub. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Responses include **`page`**, **`per_page`**, **`pages_fetched`**, **`pagination`** from the `Link` header. " +
            "Set **`all_pages`** to follow `next` links from page 1 up to **`max_pages`** (default **100**). " +
            "See [List selected repositories for immutable releases enforcement](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#list-selected-repositories-for-immutable-releases-enforcement).",
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
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.orgs.getImmutableReleasesSettingsRepositories({
                                org: input.org,
                                per_page: pp,
                                page
                            });
                            const parsed = parseRepositoriesBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
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
                    const repositories = toPlainRepositories(result.rows);
                    const successPayload: ListImmutableReleasesForOrgReposSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repositories partially listed (${result.pagesFetched} pages, ${repositories.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repositories listed successfully (${result.pagesFetched} pages, ${repositories.length} rows).`
                              : "Immutable releases enforcement repositories listed successfully.",
                        org: input.org,
                        total_count: firstTotalCount ?? repositories.length,
                        repositories,
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
                const response = await octokit.rest.orgs.getImmutableReleasesSettingsRepositories({
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const parsed = parseRepositoriesBody(response.data);
                const successPayload: ListImmutableReleasesForOrgReposSuccess = {
                    success: true,
                    message: "Immutable releases enforcement repositories listed successfully.",
                    org: input.org,
                    total_count: parsed.total_count,
                    repositories: toPlainRepositories(parsed.repositories),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListImmutableReleasesForOrgReposFailure = {
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
