import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgCampaignsFailure, ListOrgCampaignsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted. */
const DEFAULT_CAMPAIGNS_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubListOrgCampaignsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_campaigns",
        "List security campaigns for an organization (GET /orgs/{org}/campaigns). " +
            "Requires org owner or security manager; classic tokens need `security_events`. " +
            "Optional `direction`, `state`, `sort`; supports `per_page`/`page`/`all_pages`/`max_pages`. " +
            "See [List campaigns for an organization](https://docs.github.com/en/rest/campaigns/campaigns?apiVersion=2026-03-10#list-campaigns-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            direction: z.enum(["asc", "desc"]).optional(),
            state: z.enum(["open", "closed"]).optional(),
            sort: z.enum(["created", "updated", "ends_at", "published"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_CAMPAIGNS_PER_PAGE;
            const filters = {
                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.sort !== undefined ? { sort: input.sort } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.campaigns.listOrgCampaigns({
                                org: input.org,
                                ...filters,
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
                    const campaigns = result.rows.map((row) => toPlain(row));
                    const successPayload: ListOrgCampaignsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization campaigns partially listed (${result.pagesFetched} pages, ${campaigns.length} campaigns); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization campaigns retrieved successfully (${result.pagesFetched} pages, ${campaigns.length} campaigns).`
                              : "Organization campaigns retrieved successfully.",
                        org: input.org,
                        campaigns,
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
                const response = await octokit.rest.campaigns.listOrgCampaigns({
                    org: input.org,
                    ...filters,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgCampaignsSuccess = {
                    success: true,
                    message: "Organization campaigns retrieved successfully.",
                    org: input.org,
                    campaigns: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgCampaignsFailure = {
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
