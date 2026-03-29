import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgReposFailure, ListOrgReposSuccess, PublicRepoListItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (MCP default; GitHub’s API default is 30). */
const DEFAULT_PER_PAGE = 100 as const;

// Organization login: same as `github_create_org_repo`.
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function normalizeRepoRow(row: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    fork: boolean;
    default_branch: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
    owner: { login: string } | null;
}): PublicRepoListItem {
    return {
        id: row.id,
        name: row.name,
        full_name: row.full_name,
        owner_login: row.owner?.login ?? "",
        private: row.private,
        html_url: row.html_url,
        description: row.description,
        fork: row.fork,
        default_branch: row.default_branch,
        created_at: row.created_at,
        updated_at: row.updated_at,
        pushed_at: row.pushed_at
    };
}

function mapOrgRepoRows(rows: unknown[]): PublicRepoListItem[] {
    return rows.map((row) =>
        normalizeRepoRow(
            row as {
                id: number;
                name: string;
                full_name: string;
                description: string | null;
                private: boolean;
                html_url: string;
                fork: boolean;
                default_branch: string | null;
                created_at: string | null;
                updated_at: string | null;
                pushed_at: string | null;
                owner: { login: string } | null;
            }
        )
    );
}

export function registerGithubListOrgReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_repos",
        "List repositories for a GitHub organization (GET /orgs/{org}/repos). Requires a token with access to the org; " +
            "private repos appear only for appropriate scopes and membership. Use `type` to filter (`all`, `public`, `private`, `forks`, `sources`, `member`). " +
            "Manual pagination: pass `page` / `per_page` (default per page **100**); the response includes `page`, `per_page`, `pages_fetched`, and `pagination` from the `Link` header—call again with `pagination.next.page` (and `per_page`) when `pagination.next` is set. " +
            "Or set `all_pages` to true to follow `next` links automatically up to `max_pages` (default **100**); if `truncated` is true, more pages exist—continue with another call using `pagination.next` or raise `max_pages`.",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            type: z.enum(["all", "public", "private", "forks", "sources", "member"]).optional(),
            sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const allPages = input.all_pages === true;

                if (allPages) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listForOrg({
                                org: input.org,
                                type: input.type,
                                sort: input.sort,
                                direction: input.direction,
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
                    const repositories = mapOrgRepoRows(result.rows);
                    const successPayload: ListOrgReposSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization repositories partially listed (${result.pagesFetched} pages, ${repositories.length} repositories); more pages exist. Increase max_pages or continue with pagination.next.`
                            : result.pagesFetched > 1
                              ? `Organization repositories listed successfully (${result.pagesFetched} pages, ${repositories.length} repositories).`
                              : "Organization repositories listed successfully.",
                        org: input.org,
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
                const response = await octokit.rest.repos.listForOrg({
                    org: input.org,
                    type: input.type,
                    sort: input.sort,
                    direction: input.direction,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgReposSuccess = {
                    success: true,
                    message: "Organization repositories listed successfully.",
                    org: input.org,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    repositories: mapOrgRepoRows(rows),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgReposFailure = {
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
