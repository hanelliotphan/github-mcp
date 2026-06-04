import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListTeamsAssignedToOrgRoleFailure,
    ListTeamsAssignedToOrgRoleSuccess,
    OrgRoleTeamAssignmentRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainTeams(rows: unknown[]): OrgRoleTeamAssignmentRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgRoleTeamAssignmentRow);
}

export function registerGithubListTeamsAssignedToOrgRoleTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_teams_assigned_to_org_role",
        "List **teams assigned** to an organization role (GET /orgs/{org}/organization-roles/{role_id}/teams). " +
            "Returns **role assignment for a team** rows (`id`, `name`, `slug`, `permission`, `assignment` (`direct`/`indirect`/`mixed`), `permissions`, `parent`, …). " +
            "The authenticated user must be an **org admin**; classic OAuth apps and PATs need **`admin:org`** scope. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success; **404**, **422** on errors. " +
            "See [List teams that are assigned to an organization role](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#list-teams-that-are-assigned-to-an-organization-role).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            role_id: z.number().int().positive().describe("The unique identifier of the role."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/organization-roles/{role_id}/teams",
                                {
                                    org: input.org,
                                    role_id: input.role_id,
                                    per_page: pp,
                                    page
                                }
                            );
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const teams = toPlainTeams(result.rows);
                    const successPayload: ListTeamsAssignedToOrgRoleSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Teams partially listed (${result.pagesFetched} pages, ${teams.length} teams); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Teams listed successfully (${result.pagesFetched} pages, ${teams.length} teams).`
                              : "Teams listed successfully.",
                        http_status: 200,
                        org: input.org,
                        role_id: input.role_id,
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
                const response = await octokit.request(
                    "GET /orgs/{org}/organization-roles/{role_id}/teams",
                    {
                        org: input.org,
                        role_id: input.role_id,
                        per_page: perPage,
                        page
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListTeamsAssignedToOrgRoleSuccess = {
                    success: true,
                    message: "Teams listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    role_id: input.role_id,
                    teams: toPlainTeams(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListTeamsAssignedToOrgRoleFailure = {
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
