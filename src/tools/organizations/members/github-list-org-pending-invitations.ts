import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgPendingInvitationsFailure,
    ListOrgPendingInvitationsSuccess,
    OrgFailedInvitationRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

const invitationRoleFilterSchema = z.enum([
    "all",
    "admin",
    "direct_member",
    "billing_manager",
    "hiring_manager"
]);

const invitationSourceFilterSchema = z.enum(["all", "member", "scim"]);

function toPlainInvitations(rows: unknown[]): OrgFailedInvitationRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgFailedInvitationRow);
}

function buildListParams(
    org: string,
    page: number,
    perPage: number,
    role: z.infer<typeof invitationRoleFilterSchema> | undefined,
    invitation_source: z.infer<typeof invitationSourceFilterSchema> | undefined
): Record<string, unknown> {
    const params: Record<string, unknown> = {
        org,
        per_page: perPage,
        page
    };
    if (role !== undefined) {
        params.role = role;
    }
    if (invitation_source !== undefined) {
        params.invitation_source = invitation_source;
    }
    return params;
}

export function registerGithubListOrgPendingInvitationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_pending_invitations",
        "List **pending organization invitations** (GET /orgs/{org}/invitations). " +
            "Each item includes **`role`** (`direct_member`, `admin`, `billing_manager`, `hiring_manager`), invitee **`login`** (null when not a GitHub member) / **`email`**, **`inviter`**, etc., per GitHub. " +
            "Optional filters: **`role`** and **`invitation_source`** (`member`, `scim`, or **`all`**). " +
            "Requires permission to manage org membership (typically **org owner** or **admin:org** on classic PATs). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted), or **`all_pages`** with optional **`max_pages`**. " +
            "See [List pending organization invitations](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-pending-organization-invitations).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            role: invitationRoleFilterSchema
                .optional()
                .describe("Filter by invitation role (default on GitHub: all)."),
            invitation_source: invitationSourceFilterSchema
                .optional()
                .describe("Filter by invitation source (default on GitHub: all)."),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const role = input.role;
                const invitation_source = input.invitation_source;

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/invitations",
                                buildListParams(input.org, page, pp, role, invitation_source) as never
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
                    const invitations = toPlainInvitations(result.rows);
                    const successPayload: ListOrgPendingInvitationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Pending invitations partially listed (${result.pagesFetched} pages, ${invitations.length} invitations); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Pending invitations listed successfully (${result.pagesFetched} pages, ${invitations.length} invitations).`
                              : "Pending invitations listed successfully.",
                        http_status: 200,
                        org: input.org,
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
                const response = await octokit.request(
                    "GET /orgs/{org}/invitations",
                    buildListParams(input.org, page, perPage, role, invitation_source) as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgPendingInvitationsSuccess = {
                    success: true,
                    message: "Pending organization invitations listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    invitations: toPlainInvitations(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgPendingInvitationsFailure = {
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
