import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgCustomPropertyValuesFailure,
    GetOrgCustomPropertyValuesSuccess,
    OrgRepositoryCustomPropertyValuesRow,
    RepoCustomPropertyValue
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; aligned with `github_list_org_repos`). */
const DEFAULT_PER_PAGE = 100 as const;

function toRepoCustomPropertyValue(row: {
    property_name: string;
    value: string | string[] | null;
}): RepoCustomPropertyValue {
    return {
        property_name: row.property_name,
        value: row.value
    };
}

function mapOrgValueRows(rows: unknown[]): OrgRepositoryCustomPropertyValuesRow[] {
    return rows.map((row) => {
        const r = row as {
            repository_id: number;
            repository_name: string;
            repository_full_name: string;
            properties: Array<{ property_name: string; value: string | string[] | null }>;
        };
        return {
            repository_id: r.repository_id,
            repository_name: r.repository_name,
            repository_full_name: r.repository_full_name,
            properties: Array.isArray(r.properties) ? r.properties.map((p) => toRepoCustomPropertyValue(p)) : []
        };
    });
}

export function registerGithubListOrgCustomPropertyValuesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_custom_property_values",
        "List organization repositories with their custom property values (GET /orgs/{org}/properties/values). " +
            "Optional **`repository_query`** filters repos (same qualifiers as GitHub repo search). " +
            "Manual pagination: **`page`** / **`per_page`** (max **100**; default per page **100**); response includes **`pagination`** from the `Link` header. " +
            "Or set **`all_pages`: true** to follow `next` links up to **`max_pages`** (default **100**). " +
            "Organization **members** may read. " +
            "See [List custom property values for organization repositories](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#list-custom-property-values-for-organization-repositories).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            repository_query: z
                .string()
                .min(1)
                .optional()
                .describe("Optional search query to limit which org repos are returned (GitHub `repository_query`)."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const repositoryQuery = input.repository_query;
                const allPages = input.all_pages === true;

                if (allPages) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.orgs.customPropertiesForReposGetOrganizationValues({
                                org: input.org,
                                per_page: pp,
                                page,
                                ...(repositoryQuery != null ? { repository_query: repositoryQuery } : {})
                            });
                            const rows = Array.isArray(response.data) ? response.data : [];
                            return {
                                rows,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const repositories = mapOrgValueRows(result.rows);
                    const successPayload: GetOrgCustomPropertyValuesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization custom property values partially listed (${result.pagesFetched} pages, ${repositories.length} repositories); more pages exist. Increase max_pages or continue with pagination.next.`
                            : result.pagesFetched > 1
                              ? `Organization custom property values listed successfully (${result.pagesFetched} pages, ${repositories.length} repositories).`
                              : "Organization custom property values listed successfully.",
                        http_status: 200,
                        org: input.org,
                        repository_query: repositoryQuery ?? null,
                        repositories,
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
                const response = await octokit.rest.orgs.customPropertiesForReposGetOrganizationValues({
                    org: input.org,
                    per_page: perPage,
                    page,
                    ...(repositoryQuery != null ? { repository_query: repositoryQuery } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: GetOrgCustomPropertyValuesSuccess = {
                    success: true,
                    message: "Organization custom property values listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    repository_query: repositoryQuery ?? null,
                    repositories: mapOrgValueRows(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCustomPropertyValuesFailure = {
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
