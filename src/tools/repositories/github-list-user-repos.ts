import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserReposFailure, ListUserReposSuccess, PublicRepoListItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). */
const DEFAULT_PER_PAGE = 100 as const;

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

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

function mapRows(rows: unknown[]): PublicRepoListItem[] {
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

export function registerGithubListUserReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_repos",
        "List repositories for a GitHub user (GET /users/{username}/repos). Returns repositories visible for this endpoint (primarily public); " +
            "use `type` to narrow to `owner`, `member`, or `all`. Manual pagination: `page` / `per_page` (default **100**), plus `page`, `per_page`, `pages_fetched`, and `pagination` in the response. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next` or increase `max_pages`.",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            type: z.enum(["all", "owner", "member"]).optional(),
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
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listForUser({
                                username: input.username,
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
                    const repositories = mapRows(result.rows);
                    const successPayload: ListUserReposSuccess = {
                        success: true,
                        message: result.truncated
                            ? `User repositories partially listed (${result.pagesFetched} pages, ${repositories.length} repos); more pages exist.`
                            : result.pagesFetched > 1
                              ? `User repositories listed successfully (${result.pagesFetched} pages, ${repositories.length} repos).`
                              : "User repositories listed successfully.",
                        username: input.username,
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
                const response = await octokit.rest.repos.listForUser({
                    username: input.username,
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
                const successPayload: ListUserReposSuccess = {
                    success: true,
                    message: "User repositories listed successfully.",
                    username: input.username,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    repositories: mapRows(rows),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserReposFailure = {
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
