import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoContributorsFailure,
    ListRepoContributorsSuccess,
    RepoContributorItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted; set explicitly because MCP clients may not apply Zod defaults. */
const DEFAULT_CONTRIBUTORS_PER_PAGE = 100 as const;

function normalizeContributor(row: {
    login?: string | null;
    id?: number | null;
    contributions: number;
    html_url?: string | null;
    avatar_url?: string | null;
    type?: string | null;
    name?: string | null;
    email?: string | null;
}): RepoContributorItem {
    return {
        login: row.login ?? null,
        id: typeof row.id === "number" ? row.id : null,
        contributions: row.contributions,
        html_url: row.html_url ?? null,
        avatar_url: row.avatar_url ?? null,
        type: row.type ?? null,
        name: row.name ?? null,
        email: row.email ?? null
    };
}

function isHttp204(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { status?: number }).status === 204;
}

export function registerGithubListRepoContributorsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_contributors",
        "List contributors to a repository (GET /repos/{owner}/{repo}/contributors). Results are sorted by number of commits per contributor (descending). " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; responses include `page`, `per_page`, `pages_fetched`, and `pagination`. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next` or increase `max_pages`. " +
            "Returns 204 for an empty repository; that is surfaced as an empty `contributors` list. Optional `include_anonymous` maps to GitHub’s `anon` query parameter.",
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
            include_anonymous: z.boolean().optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_CONTRIBUTORS_PER_PAGE;
            const mapRows = (rows: unknown[]) =>
                rows.map((row) =>
                    normalizeContributor(
                        row as {
                            login?: string | null;
                            id?: number | null;
                            contributions: number;
                            html_url?: string | null;
                            avatar_url?: string | null;
                            type?: string | null;
                            name?: string | null;
                            email?: string | null;
                        }
                    )
                );

            const fetchContributorsPage = async (page: number, pp: number) => {
                try {
                    const response = await octokit.rest.repos.listContributors({
                        owner: input.owner,
                        repo: input.name,
                        anon: input.include_anonymous === true ? "1" : undefined,
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
                } catch (error: unknown) {
                    if (isHttp204(error)) {
                        return {
                            rows: [] as unknown[],
                            linkHeader: undefined as string | undefined,
                            requestId: getRequestId(
                                (error as { response?: { headers?: Record<string, unknown> } }).response
                                    ?.headers?.["x-github-request-id"]
                            )
                        };
                    }
                    throw error;
                }
            };

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: fetchContributorsPage
                    });
                    const contributors = mapRows(result.rows);
                    const successPayload: ListRepoContributorsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repository contributors partially listed (${result.pagesFetched} pages, ${contributors.length} contributors); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repository contributors retrieved successfully (${result.pagesFetched} pages, ${contributors.length} contributors).`
                              : contributors.length === 0
                                ? "Repository has no commits yet (empty contributors list)."
                                : "Repository contributors retrieved successfully.",
                        contributors,
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
                const { rows, linkHeader, requestId } = await fetchContributorsPage(page, perPage);
                const successPayload: ListRepoContributorsSuccess = {
                    success: true,
                    message: "Repository contributors retrieved successfully.",
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    contributors: mapRows(rows),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const requestId = getRequestId(
                    (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                        "x-github-request-id"
                    ]
                );
                if (isHttp204(error)) {
                    const emptyPayload: ListRepoContributorsSuccess = {
                        success: true,
                        message: "Repository has no commits yet (GitHub returned 204); contributors list is empty.",
                        contributors: [],
                        pagination: null,
                        request_id: requestId,
                        page: input.page ?? 1,
                        per_page: perPage,
                        pages_fetched: 1
                    };
                    return textAndData(emptyPayload);
                }
                const failurePayload: ListRepoContributorsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: requestId
                };
                return textAndData(failurePayload);
            }
        }
    );
}
