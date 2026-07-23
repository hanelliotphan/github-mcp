import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListEnterpriseTeamOrganizationAssignmentsFailure,
    ListEnterpriseTeamOrganizationAssignmentsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubListEnterpriseTeamOrganizationAssignmentsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_enterprise_team_organization_assignments",
        "List organization assignments for an enterprise team (GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations). " +
            "Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. " +
            "Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Get organization assignments](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-organizations?apiVersion=2026-03-10#get-organization-assignments).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(50)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
            enterprise_team: z.string().min(1).describe("Enterprise team slug or ID."),
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
                            const response = await octokit.rest.enterpriseTeamOrganizations.getAssignments({
                                enterprise: input.enterprise,
                                "enterprise-team": input.enterprise_team,
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
                    const organizations = toPlainRows(result.rows);
                    const successPayload: ListEnterpriseTeamOrganizationAssignmentsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization assignments partially listed (${result.pagesFetched} pages, ${organizations.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization assignments retrieved successfully (${result.pagesFetched} pages, ${organizations.length} items).`
                              : "Organization assignments retrieved successfully.",
                        enterprise: input.enterprise,
                        enterprise_team: input.enterprise_team,
                        organizations,
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
                const response = await octokit.rest.enterpriseTeamOrganizations.getAssignments({
                    enterprise: input.enterprise,
                    "enterprise-team": input.enterprise_team,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListEnterpriseTeamOrganizationAssignmentsSuccess = {
                    success: true,
                    message: "Organization assignments retrieved successfully.",
                    enterprise: input.enterprise,
                    enterprise_team: input.enterprise_team,
                    organizations: toPlainRows(rows),
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
                const failurePayload: ListEnterpriseTeamOrganizationAssignmentsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
