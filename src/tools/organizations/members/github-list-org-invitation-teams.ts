import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgInvitationTeamsFailure,
    ListOrgInvitationTeamsSuccess,
    OrgInvitationTeamRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainTeams(rows: unknown[]): OrgInvitationTeamRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgInvitationTeamRow);
}

export function registerGithubListOrgInvitationTeamsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_invitation_teams",
        "List **teams for an organization invitation** (GET /orgs/{org}/invitations/{invitation_id}/teams). " +
            "Returns full **Team** objects (id, name, slug, permission, html_url, …) per GitHub. " +
            "Requires permission to see org invitations (typically **organization owner** or **`admin:org`** on classic PATs). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted), or **`all_pages`** with optional **`max_pages`**. " +
            "See [List organization invitation teams](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-organization-invitation-teams).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            invitation_id: z
                .number()
                .int()
                .positive()
                .describe("Numeric id of the invitation (from list pending invitations or create invitation)."),
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
                                "GET /orgs/{org}/invitations/{invitation_id}/teams",
                                {
                                    org: input.org,
                                    invitation_id: input.invitation_id,
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
                    const successPayload: ListOrgInvitationTeamsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Invitation teams partially listed (${result.pagesFetched} pages, ${teams.length} teams); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Invitation teams listed successfully (${result.pagesFetched} pages, ${teams.length} teams).`
                              : "Invitation teams listed successfully.",
                        http_status: 200,
                        org: input.org,
                        invitation_id: input.invitation_id,
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
                const response = await octokit.request("GET /orgs/{org}/invitations/{invitation_id}/teams", {
                    org: input.org,
                    invitation_id: input.invitation_id,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgInvitationTeamsSuccess = {
                    success: true,
                    message: "Organization invitation teams listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    invitation_id: input.invitation_id,
                    teams: toPlainTeams(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgInvitationTeamsFailure = {
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
