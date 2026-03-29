import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserReposFailure, ListUserReposSuccess, PublicRepoListItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (MCP default; GitHub’s API default is 30). */
const DEFAULT_PER_PAGE = 100 as const;

// GitHub user handle (same constraints as `owner` in other tools).
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

export function registerGithubListUserReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_repos",
        "List repositories for a GitHub user (GET /users/{username}/repos). Returns repositories visible for this endpoint (primarily public); " +
            "use `type` to narrow to `owner`, `member`, or `all`. Pagination uses `page` / `per_page`; `pagination` reflects the `Link` header when present.",
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
            page: z.number().int().min(1).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const response = await octokit.rest.repos.listForUser({
                    username: input.username,
                    type: input.type,
                    sort: input.sort,
                    direction: input.direction,
                    per_page: perPage,
                    page: input.page
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
                    repositories: rows.map((row) =>
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
                    ),
                    request_id: requestId
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
