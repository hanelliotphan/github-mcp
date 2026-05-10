import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgFailedInvitationsFailure,
    ListOrgFailedInvitationsSuccess,
    OrgFailedInvitationRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainInvitations(rows: unknown[]): OrgFailedInvitationRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgFailedInvitationRow);
}

export function registerGithubListOrgFailedInvitationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_failed_invitations",
        "List **failed organization invitations** (GET /orgs/{org}/failed_invitations). " +
            "Each item includes **`failed_at`** and **`failed_reason`** when GitHub provides them, plus invitee **`login`** / **`email`**, **`role`**, **`inviter`**, etc., per GitHub. " +
            "Requires permission to manage org membership (typically **org owner** or **admin:org** on classic PATs). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted), or **`all_pages`** with optional **`max_pages`**. " +
            "See [List failed organization invitations](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-failed-organization-invitations).",
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
                            const response = await octokit.request("GET /orgs/{org}/failed_invitations", {
                                org: input.org,
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
                    const invitations = toPlainInvitations(result.rows);
                    const successPayload: ListOrgFailedInvitationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Failed invitations partially listed (${result.pagesFetched} pages, ${invitations.length} invitations); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Failed invitations listed successfully (${result.pagesFetched} pages, ${invitations.length} invitations).`
                              : "Failed invitations listed successfully.",
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
                const response = await octokit.request("GET /orgs/{org}/failed_invitations", {
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgFailedInvitationsSuccess = {
                    success: true,
                    message: "Failed organization invitations listed successfully.",
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
                const failurePayload: ListOrgFailedInvitationsFailure = {
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
