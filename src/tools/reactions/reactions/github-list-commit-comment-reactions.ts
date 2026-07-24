import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListCommitCommentReactionsSuccess,
    ListCommitCommentReactionsFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import {
    getLinkHeaderFromResponse,
    parseGitHubPageLinkPagination
} from "../../../utils/parse-github-link-header.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListCommitCommentReactionsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_commit_comment_reactions",
        "List reactions for a commit comment (GET /repos/{owner}/{repo}/comments/{comment_id}/reactions). " +
            "Optional **`content`** filters by reaction type. Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. " +
            "`per_page` defaults to **100** when omitted (GitHub max **100**). " +
            "See [List reactions for a commit comment](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10#list-reactions-for-a-commit-comment).",
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
            comment_id: z.number().int().positive(),
            content: z.enum(["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.content !== undefined ? { content: input.content } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.reactions.listForCommitComment({
                                owner: input.owner,
                                repo: input.name,
                                comment_id: input.comment_id,
                                ...filters,
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
                    const reactions = toPlainRows(result.rows);
                    const successPayload: ListCommitCommentReactionsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Commit comment reactions partially listed (${result.pagesFetched} pages, ${reactions.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Commit comment reactions retrieved successfully (${result.pagesFetched} pages, ${reactions.length} items).`
                              : "Commit comment reactions retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        comment_id: input.comment_id,
                        reactions,
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
                const response = await octokit.rest.reactions.listForCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    comment_id: input.comment_id,
                    ...filters,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListCommitCommentReactionsSuccess = {
                    success: true,
                    message: "Commit comment reactions retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    comment_id: input.comment_id,
                    reactions: toPlainRows(Array.isArray(response.data) ? response.data : []),
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
                const failurePayload: ListCommitCommentReactionsFailure = {
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
