import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListUserProjectsSuccess,
    ListUserProjectsFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => toPlain(row));
}

export function registerGithubListUserProjectsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_projects",
        "List user-owned projects (GET /users/{username}/projectsV2). " +
            "Uses cursor pagination (`after` / `before`). Set `all_pages` to follow `next` up to `max_pages` (default **100**). " +
            "`per_page` defaults to **100** when omitted (GitHub max **100**). " +
            "See [List projects for user](https://docs.github.com/en/rest/projects/projects?apiVersion=2026-03-10#list-projects-for-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    loginRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            q: z.string().optional().describe("Limit results to projects of the specified type"),

            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().optional(),
            after: z.string().optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;

                const fetchChunk = async (cursors: { after?: string; before?: string }) => {
                    const params: Record<string, unknown> = {
                        username: input.username,
                        per_page: perPage,
                        before: cursors.before,
                        after: cursors.after
                    };
                    if (input.q !== undefined) {
                        params.q = input.q;
                    }
                    const response = await octokit.rest.projects.listForUser(params as never);
                    return {
                        rows: Array.isArray(response.data) ? response.data : [],
                        linkHeader: getLinkHeaderFromResponse(response.headers),
                        requestId: getRequestId(response.headers["x-github-request-id"])
                    };
                };

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk
                    });
                    const projects = toPlainList(result.rows);
                    const successPayload: ListUserProjectsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `User projects partially listed (${result.pagesFetched} pages, ${projects.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `User projects retrieved successfully (${result.pagesFetched} pages, ${projects.length} items).`
                              : "User projects retrieved successfully.",
                        username: input.username,
                        projects,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const { rows, linkHeader, requestId } = await fetchChunk({
                    after: input.after,
                    before: input.before
                });
                const successPayload: ListUserProjectsSuccess = {
                    success: true,
                    message: "User projects retrieved successfully.",
                    username: input.username,
                    projects: toPlainList(rows),
                    pagination: parseGitHubLinkPagination(linkHeader),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserProjectsFailure = {
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
