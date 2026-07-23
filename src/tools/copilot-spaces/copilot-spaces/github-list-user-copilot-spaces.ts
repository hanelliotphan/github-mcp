import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserCopilotSpacesSuccess, ListUserCopilotSpacesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function getSpaces(data: unknown): Record<string, unknown>[] {
    if (data && typeof data === "object" && "spaces" in data) {
        const rows = (data as { spaces?: unknown }).spaces;
        return Array.isArray(rows) ? rows.map((row) => toPlain(row)) : [];
    }
    return [];
}

export function registerGithubListUserCopilotSpacesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_copilot_spaces",
        "List Copilot Spaces for a user (GET /users/{username}/copilot-spaces). Cursor pagination via before/after/per_page; supports all_pages/max_pages. Returns spaces array. See [List Copilot Spaces for a user](https://docs.github.com/en/rest/copilot-spaces/copilot-spaces?apiVersion=2026-03-10#list-copilot-spaces-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const fetchChunk = async (cursors: { after?: string; before?: string }) => {
                    const response = await octokit.request("GET /users/{username}/copilot-spaces", {
                        username: input.username,
                        per_page: perPage,
                        ...(cursors.after ? { after: cursors.after } : {}),
                        ...(cursors.before ? { before: cursors.before } : {})
                    } as never);
                    return {
                        rows: getSpaces(response.data),
                        linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
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
                    const spaces = result.rows;
                    const successPayload: ListUserCopilotSpacesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Copilot Spaces partially listed (${result.pagesFetched} pages, ${spaces.length} spaces); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Copilot Spaces listed successfully (${result.pagesFetched} pages, ${spaces.length} spaces).`
                              : "Copilot Spaces listed successfully.",
                        username: input.username,
                        spaces,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const { rows, linkHeader, requestId } = await fetchChunk({ after: input.after, before: input.before });
                const successPayload: ListUserCopilotSpacesSuccess = {
                    success: true,
                    message: "Copilot Spaces listed successfully.",
                    username: input.username,
                    spaces: rows,
                    pagination: parseGitHubLinkPagination(linkHeader),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserCopilotSpacesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
