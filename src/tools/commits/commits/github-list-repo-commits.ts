import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoCommitsFailure, ListRepoCommitsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListRepoCommitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_commits",
        "List commits (GET /repos/{owner}/{repo}/commits). Optional sha, path, author, committer, since, and until filters. Page pagination with all_pages/max_pages. See [List commits](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10#list-commits).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            sha: z.string().min(1).max(255).optional(),
            path: z.string().min(1).optional(),
            author: z.string().min(1).optional(),
            committer: z.string().min(1).optional(),
            since: z.string().min(1).optional(),
            until: z.string().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const listParams = {
                owner: input.owner,
                repo: input.name,
                ...(input.sha !== undefined ? { sha: input.sha } : {}),
                ...(input.path !== undefined ? { path: input.path } : {}),
                ...(input.author !== undefined ? { author: input.author } : {}),
                ...(input.committer !== undefined ? { committer: input.committer } : {}),
                ...(input.since !== undefined ? { since: input.since } : {}),
                ...(input.until !== undefined ? { until: input.until } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listCommits({
                                ...listParams,
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
                    const commits = toPlainRows(result.rows);
                    const successPayload: ListRepoCommitsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Results partially listed (${result.pagesFetched} pages, ${commits.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Results retrieved successfully (${result.pagesFetched} pages, ${commits.length} items).`
                              : "Results retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        commits,
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
                const response = await octokit.rest.repos.listCommits({
                    ...listParams,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoCommitsSuccess = {
                    success: true,
                    message: "Results retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    commits: toPlainRows(rows),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoCommitsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
