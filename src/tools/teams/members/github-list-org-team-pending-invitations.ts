import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgTeamPendingInvitationsFailure,
    ListOrgTeamPendingInvitationsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListOrgTeamPendingInvitationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_team_pending_invitations",
        "List pending team invitations (GET /orgs/{org}/teams/{team_slug}/invitations). " +
            "Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. " +
            "See [List pending team invitations](https://docs.github.com/en/rest/teams/members?apiVersion=2026-03-10#list-pending-team-invitations).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            team_slug: z.string().min(1).describe("The slug of the team name."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.teams.listPendingInvitationsInOrg({
                                org: input.org,
                                team_slug: input.team_slug,
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
                    const invitations = toPlainRows(result.rows);
                    const successPayload: ListOrgTeamPendingInvitationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Pending invitations partially listed (${result.pagesFetched} pages, ${invitations.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Pending invitations retrieved successfully (${result.pagesFetched} pages, ${invitations.length} items).`
                              : "Pending team invitations listed successfully.",
                        org: input.org,
                        team_slug: input.team_slug,
                        invitations,
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
                const response = await octokit.rest.teams.listPendingInvitationsInOrg({
                    org: input.org,
                    team_slug: input.team_slug,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgTeamPendingInvitationsSuccess = {
                    success: true,
                    message: "Pending team invitations listed successfully.",
                    org: input.org,
                    team_slug: input.team_slug,
                    invitations: toPlainRows(rows),
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
                const failurePayload: ListOrgTeamPendingInvitationsFailure = {
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
