import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AuthUserOrgMembershipRow,
    ListOrgMembershipsForAuthUserFailure,
    ListOrgMembershipsForAuthUserSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

const membershipStateSchema = z.enum(["active", "pending"]);

function toPlainMemberships(rows: unknown[]): AuthUserOrgMembershipRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as AuthUserOrgMembershipRow);
}

function buildParams(
    page: number,
    perPage: number,
    state: z.infer<typeof membershipStateSchema> | undefined
): Record<string, unknown> {
    const params: Record<string, unknown> = {
        per_page: perPage,
        page
    };
    if (state !== undefined) {
        params.state = state;
    }
    return params;
}

export function registerGithubListOrgMembershipsForAuthUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_memberships_for_auth_user",
        "List **organization memberships** for the authenticated user (GET /user/memberships/orgs). " +
            "Each item is an **Org Membership** (`state`, `role`, `organization`, `user`, `permissions`, …), not the same shape as **`github_list_orgs_for_authenticated_user`** (`GET /user/orgs`). " +
            "Optional **`state`**: **`active`** or **`pending`** (omit to return both per GitHub). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted), or **`all_pages`** with optional **`max_pages`**. " +
            "See [List organization memberships for the authenticated user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-organization-memberships-for-the-authenticated-user).",
        {
            state: membershipStateSchema
                .optional()
                .describe("Filter by membership state (omit for both active and pending per GitHub)."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const state = input.state;

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /user/memberships/orgs",
                                buildParams(page, pp, state) as never
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
                    const memberships = toPlainMemberships(result.rows);
                    const successPayload: ListOrgMembershipsForAuthUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization memberships partially listed (${result.pagesFetched} pages, ${memberships.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization memberships listed successfully (${result.pagesFetched} pages, ${memberships.length} rows).`
                              : "Organization memberships for the authenticated user listed successfully.",
                        http_status: 200,
                        memberships,
                        ...(state !== undefined ? { state } : {}),
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
                    "GET /user/memberships/orgs",
                    buildParams(page, perPage, state) as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgMembershipsForAuthUserSuccess = {
                    success: true,
                    message: "Organization memberships for the authenticated user listed successfully.",
                    http_status: response.status,
                    memberships: toPlainMemberships(rows),
                    ...(state !== undefined ? { state } : {}),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgMembershipsForAuthUserFailure = {
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
