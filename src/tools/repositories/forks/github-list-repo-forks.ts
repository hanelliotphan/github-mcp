import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoForksFailure, ListRepoForksSuccess, RepoForkItem } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (aligned with other MCP list tools). */
const DEFAULT_FORKS_PER_PAGE = 100 as const;

const sortSchema = z.enum(["newest", "oldest", "stargazers", "watchers"]);

function normalizeFork(row: {
    id: number;
    name: string;
    full_name: string;
    owner?: { login?: string } | null;
    private: boolean;
    html_url: string;
    description?: string | null;
    fork: boolean;
    default_branch?: string | null;
    stargazers_count?: number;
    watchers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
    pushed_at?: string | null;
}): RepoForkItem {
    return {
        id: row.id,
        name: row.name,
        full_name: row.full_name,
        owner_login: row.owner?.login ?? "",
        private: row.private,
        html_url: row.html_url,
        description: row.description ?? null,
        fork: row.fork,
        default_branch: row.default_branch ?? null,
        stargazers_count: row.stargazers_count ?? 0,
        watchers_count: row.watchers_count ?? 0,
        forks_count: row.forks_count ?? 0,
        open_issues_count: row.open_issues_count ?? 0,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
        pushed_at: row.pushed_at ?? null
    };
}

export function registerGithubListRepoForksTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_forks",
        "List forks of a repository (GET /repos/{owner}/{repo}/forks). Requires read access to the repo. " +
            "Optional `sort`: newest (default), oldest, stargazers, or watchers. " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; responses include `page`, `per_page`, `pages_fetched`, `sort`, and `pagination`. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next` or increase `max_pages`. " +
            "See GitHub REST docs for repository forks.",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            sort: sortSchema.optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const effectiveSort = input.sort ?? "newest";
            const perPage = input.per_page ?? DEFAULT_FORKS_PER_PAGE;

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listForks({
                                owner: input.owner,
                                repo: input.name,
                                sort: effectiveSort,
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
                    const forks = result.rows.map((row) => normalizeFork(row as Parameters<typeof normalizeFork>[0]));
                    const successPayload: ListRepoForksSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repository forks partially listed (${result.pagesFetched} pages, ${forks.length} forks); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repository forks retrieved successfully (${result.pagesFetched} pages, ${forks.length} forks).`
                              : "Repository forks retrieved successfully.",
                        forks,
                        sort: effectiveSort,
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
                const response = await octokit.rest.repos.listForks({
                    owner: input.owner,
                    repo: input.name,
                    sort: effectiveSort,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoForksSuccess = {
                    success: true,
                    message: "Repository forks retrieved successfully.",
                    forks: rows.map((row) => normalizeFork(row as Parameters<typeof normalizeFork>[0])),
                    sort: effectiveSort,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoForksFailure = {
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
