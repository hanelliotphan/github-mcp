import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AuthenticatedUserRepoListItem,
    ListAuthenticatedUserReposFailure,
    ListAuthenticatedUserReposSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (MCP default; GitHub’s API default is 30). */
const DEFAULT_PER_PAGE = 100 as const;

function normalizeUserRepo(row: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    visibility?: string | null;
    html_url: string;
    fork: boolean;
    default_branch: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
    owner: { login: string } | null;
    permissions?: {
        admin?: boolean;
        maintain?: boolean;
        push?: boolean;
        triage?: boolean;
        pull?: boolean;
    } | null;
}): AuthenticatedUserRepoListItem {
    return {
        id: row.id,
        name: row.name,
        full_name: row.full_name,
        owner_login: row.owner?.login ?? "",
        private: row.private,
        visibility: row.visibility ?? null,
        html_url: row.html_url,
        description: row.description,
        fork: row.fork,
        default_branch: row.default_branch,
        created_at: row.created_at,
        updated_at: row.updated_at,
        pushed_at: row.pushed_at,
        permissions: row.permissions
            ? {
                  admin: row.permissions.admin ?? false,
                  maintain: row.permissions.maintain ?? false,
                  push: row.permissions.push ?? false,
                  triage: row.permissions.triage ?? false,
                  pull: row.permissions.pull ?? false
              }
            : null
    };
}

export function registerGithubListAuthenticatedUserReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_authenticated_user_repos",
        "List repositories the authenticated user has explicit access to (GET /user/repos): owned repos, " +
            "collaborations, and org repos. Supports filters (`visibility`, `affiliation`, `type`), sort, " +
            "`since`/`before` updated-time bounds, and `page` / `per_page`. " +
            "Do not use `type` together with `visibility` or `affiliation` (GitHub returns 422). " +
            "When more pages exist, the response includes `pagination` from the `Link` header.",
        {
            visibility: z.enum(["all", "public", "private"]).optional(),
            affiliation: z.string().min(1).optional(),
            type: z.enum(["all", "owner", "public", "private", "member"]).optional(),
            sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            since: z.string().min(1).optional(),
            before: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const response = await octokit.rest.repos.listForAuthenticatedUser({
                    visibility: input.visibility,
                    affiliation: input.affiliation,
                    type: input.type,
                    sort: input.sort,
                    direction: input.direction,
                    per_page: perPage,
                    page: input.page,
                    since: input.since,
                    before: input.before
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListAuthenticatedUserReposSuccess = {
                    success: true,
                    message: "Repositories for the authenticated user listed successfully.",
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    repositories: rows.map((row) =>
                        normalizeUserRepo(
                            row as {
                                id: number;
                                name: string;
                                full_name: string;
                                description: string | null;
                                private: boolean;
                                visibility?: string | null;
                                html_url: string;
                                fork: boolean;
                                default_branch: string | null;
                                created_at: string | null;
                                updated_at: string | null;
                                pushed_at: string | null;
                                owner: { login: string } | null;
                                permissions?: {
                                    admin?: boolean;
                                    maintain?: boolean;
                                    push?: boolean;
                                    triage?: boolean;
                                    pull?: boolean;
                                } | null;
                            }
                        )
                    ),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAuthenticatedUserReposFailure = {
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
