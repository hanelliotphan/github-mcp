import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoTeamsFailure, ListRepoTeamsSuccess, RepoTeamItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). */
const DEFAULT_TEAMS_PER_PAGE = 100 as const;

function normalizeTeam(row: {
    id: number;
    node_id: string;
    name: string;
    slug: string;
    description: string | null;
    privacy?: string | null;
    notification_setting?: string | null;
    permission: string;
    permissions: {
        pull: boolean;
        triage?: boolean;
        push: boolean;
        maintain?: boolean;
        admin: boolean;
    };
    url: string;
    html_url: string;
    members_url: string;
    repositories_url: string;
    type: string;
    organization_id?: number | null;
    enterprise_id?: number | null;
    parent?: unknown;
}): RepoTeamItem {
    const rawParent = row.parent as {
        id?: number;
        slug?: string;
        name?: string;
        html_url?: string;
    } | null;
    const parent =
        rawParent != null && typeof rawParent === "object" && typeof rawParent.id === "number"
            ? {
                  id: rawParent.id,
                  slug: rawParent.slug ?? "",
                  name: rawParent.name ?? "",
                  html_url: rawParent.html_url ?? ""
              }
            : null;

    return {
        id: row.id,
        node_id: row.node_id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? null,
        privacy: row.privacy ?? null,
        notification_setting: row.notification_setting ?? null,
        permission: row.permission,
        permissions: {
            pull: row.permissions.pull,
            triage: row.permissions.triage ?? false,
            push: row.permissions.push,
            maintain: row.permissions.maintain ?? false,
            admin: row.permissions.admin
        },
        url: row.url,
        html_url: row.html_url,
        members_url: row.members_url,
        repositories_url: row.repositories_url,
        type: row.type,
        organization_id: row.organization_id ?? null,
        enterprise_id: row.enterprise_id ?? null,
        parent
    };
}

export function registerGithubListRepoTeamsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_teams",
        "List teams with access to a repository (GET /repos/{owner}/{repo}/teams). " +
            "Teams must be visible to the authenticated user. For a public repository, " +
            "a team appears only if it explicitly added that repo. " +
            "Classic tokens: public_repo or repo for public repos; repo for private. " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; responses include `page`, `per_page`, `pages_fetched`, and `pagination`. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next` or increase `max_pages`.",
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
                const perPage = input.per_page ?? DEFAULT_TEAMS_PER_PAGE;
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listTeams({
                                owner: input.owner,
                                repo: input.name,
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
                    const teams = result.rows.map((row) => normalizeTeam(row as never));
                    const successPayload: ListRepoTeamsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repository teams partially listed (${result.pagesFetched} pages, ${teams.length} teams); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repository teams retrieved successfully (${result.pagesFetched} pages, ${teams.length} teams).`
                              : "Repository teams retrieved successfully.",
                        teams,
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
                const response = await octokit.rest.repos.listTeams({
                    owner: input.owner,
                    repo: input.name,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoTeamsSuccess = {
                    success: true,
                    message: "Repository teams retrieved successfully.",
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    teams: rows.map((row) => normalizeTeam(row as never)),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoTeamsFailure = {
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
