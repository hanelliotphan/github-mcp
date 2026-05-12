import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgMembersFailure,
    ListOrgMembersSuccess,
    OrgMemberUserRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

const orgMembersFilterSchema = z.enum(["2fa_disabled", "2fa_insecure", "all"]);

const orgMembersRoleFilterSchema = z.enum(["all", "admin", "member"]);

function toPlainMembers(rows: unknown[]): OrgMemberUserRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgMemberUserRow);
}

function buildListParams(
    org: string,
    page: number,
    perPage: number,
    filter: z.infer<typeof orgMembersFilterSchema> | undefined,
    role: z.infer<typeof orgMembersRoleFilterSchema> | undefined
): Record<string, unknown> {
    const params: Record<string, unknown> = {
        org,
        per_page: perPage,
        page
    };
    if (filter !== undefined) {
        params.filter = filter;
    }
    if (role !== undefined) {
        params.role = role;
    }
    return params;
}

export function registerGithubListOrgMembersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_members",
        "List **organization members** (GET /orgs/{org}/members). " +
            "Returns **Simple User** objects (`login`, `id`, `avatar_url`, …). " +
            "If the authenticated user is a member of the org, **concealed** members are included per GitHub. " +
            "Optional **`filter`**: `2fa_disabled`, `2fa_insecure`, or **`all`** (owner-only filters). " +
            "Optional **`role`**: **`all`**, `admin`, or **`member`** (GitHub defaults when omitted: **all** for both). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted), or **`all_pages`** with optional **`max_pages`**. " +
            "See [List organization members](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#list-organization-members).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            filter: orgMembersFilterSchema
                .optional()
                .describe("Owner-only: members without 2FA, insecure 2FA, or all (GitHub default: all)."),
            role: orgMembersRoleFilterSchema
                .optional()
                .describe("Filter by org role (GitHub default: all)."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const filter = input.filter;
                const role = input.role;

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/members",
                                buildListParams(input.org, page, pp, filter, role) as never
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
                    const members = toPlainMembers(result.rows);
                    const successPayload: ListOrgMembersSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Members partially listed (${result.pagesFetched} pages, ${members.length} users); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Members listed successfully (${result.pagesFetched} pages, ${members.length} users).`
                              : "Organization members listed successfully.",
                        http_status: 200,
                        org: input.org,
                        members,
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
                    "GET /orgs/{org}/members",
                    buildListParams(input.org, page, perPage, filter, role) as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgMembersSuccess = {
                    success: true,
                    message: "Organization members listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    members: toPlainMembers(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgMembersFailure = {
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
