import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListReposStarredByUserFailure,
    ListReposStarredByUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 30 as const;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListReposStarredByUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repos_starred_by_user",
        "List repositories a user has starred (GET /users/{username}/starred). " +
            "Sort by **`sort`** = `created` (when starred; default) or `updated` (last push), and **`direction`** = `desc` (default) or `asc`. " +
            "Use `per_page` (1–100, default **30** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List repositories starred by a user](https://docs.github.com/en/rest/activity/starring?apiVersion=2026-03-10#list-repositories-starred-by-a-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            sort: z.enum(["created", "updated"]).optional().describe("Sort by when the repo was starred (`created`, default) or last pushed (`updated`)."),
            direction: z.enum(["asc", "desc"]).optional().describe("Sort direction (default `desc`)."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const sort = input.sort ?? "created";
            const direction = input.direction ?? "desc";
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.activity.listReposStarredByUser({
                                username: input.username,
                                sort,
                                direction,
                                per_page: pp,
                                page
                            });
                            return {
                                rows: (Array.isArray(response.data) ? response.data : []) as unknown[],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const starredRepositories = toPlain(result.rows);
                    const successPayload: ListReposStarredByUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Starred repositories partially listed (${result.pagesFetched} pages, ${starredRepositories.length} repos); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Starred repositories listed successfully (${result.pagesFetched} pages, ${starredRepositories.length} repos).`
                              : "Starred repositories listed successfully.",
                        username: input.username,
                        sort,
                        direction,
                        starred_repositories: starredRepositories,
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
                const response = await octokit.rest.activity.listReposStarredByUser({
                    username: input.username,
                    sort,
                    direction,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListReposStarredByUserSuccess = {
                    success: true,
                    message: "Starred repositories listed successfully.",
                    username: input.username,
                    sort,
                    direction,
                    starred_repositories: toPlain(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListReposStarredByUserFailure = {
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
