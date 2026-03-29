import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoTopicsFailure, ListRepoTopicsSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (MCP default; GitHub’s API default is 30). */
const DEFAULT_TOPICS_PER_PAGE = 100 as const;

export function registerGithubListRepoTopicsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_topics",
        "List repository topics (GET /repos/{owner}/{repo}/topics). " +
            "Returns the `names` array for the requested page (concatenated across pages when `all_pages` is true). " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; responses include `page`, `per_page`, `pages_fetched`, and `pagination`. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next` or increase `max_pages`. " +
            "Requires read access; classic tokens need public_repo or repo scope for public repos and repo for private (per GitHub).",
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
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_TOPICS_PER_PAGE;
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.getAllTopics({
                                owner: input.owner,
                                repo: input.name,
                                per_page: pp,
                                page
                            });
                            const names = Array.isArray(response.data.names) ? response.data.names : [];
                            return {
                                rows: names,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const names = result.rows;
                    const successPayload: ListRepoTopicsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repository topics partially listed (${result.pagesFetched} pages, ${names.length} names on this run); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repository topics retrieved successfully (${result.pagesFetched} pages, ${names.length} names).`
                              : "Repository topics retrieved successfully.",
                        names,
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
                const response = await octokit.rest.repos.getAllTopics({
                    owner: input.owner,
                    repo: input.name,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const names = Array.isArray(response.data.names) ? response.data.names : [];
                const successPayload: ListRepoTopicsSuccess = {
                    success: true,
                    message: "Repository topics retrieved successfully.",
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    names,
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoTopicsFailure = {
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
