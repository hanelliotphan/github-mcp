import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgOutsideCollaboratorsFailure,
    ListOrgOutsideCollaboratorsSuccess,
    OrgOutsideCollaboratorRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;
const DEFAULT_FILTER = "all" as const;

function toPlainCollaborators(rows: unknown[]): OrgOutsideCollaboratorRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgOutsideCollaboratorRow);
}

export function registerGithubListOrgOutsideCollaboratorsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_outside_collaborators",
        "List **outside collaborators** of an organization (GET /orgs/{org}/outside_collaborators). Returns **simple user** rows per GitHub. " +
            "Optional **`filter`**: `all` (default), `2fa_disabled` (only collaborators without 2FA), or `2fa_insecure` (only collaborators with insecure 2FA methods). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success. " +
            "See [List outside collaborators for an organization](https://docs.github.com/en/rest/orgs/outside-collaborators?apiVersion=2026-03-10#list-outside-collaborators-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            filter: z
                .enum(["2fa_disabled", "2fa_insecure", "all"])
                .optional()
                .describe("Filter collaborators. Default: all."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const filter = input.filter ?? DEFAULT_FILTER;
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.orgs.listOutsideCollaborators({
                                org: input.org,
                                filter,
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
                    const outside_collaborators = toPlainCollaborators(result.rows);
                    const successPayload: ListOrgOutsideCollaboratorsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Outside collaborators partially listed (${result.pagesFetched} pages, ${outside_collaborators.length} users); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Outside collaborators listed successfully (${result.pagesFetched} pages, ${outside_collaborators.length} users).`
                              : "Outside collaborators listed successfully.",
                        http_status: 200,
                        org: input.org,
                        filter,
                        outside_collaborators,
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
                const response = await octokit.rest.orgs.listOutsideCollaborators({
                    org: input.org,
                    filter,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgOutsideCollaboratorsSuccess = {
                    success: true,
                    message: "Outside collaborators listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    filter,
                    outside_collaborators: toPlainCollaborators(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgOutsideCollaboratorsFailure = {
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
