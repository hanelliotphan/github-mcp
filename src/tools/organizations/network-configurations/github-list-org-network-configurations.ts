import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgNetworkConfigurationsFailure,
    ListOrgNetworkConfigurationsSuccess,
    OrgNetworkConfigurationItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

/** Default when `per_page` is omitted (**100**; aligned with other MCP list tools). GitHub’s API default is **30**. */
const DEFAULT_PER_PAGE = 100 as const;

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseNetworkConfigurationsBody(data: unknown): {
    total_count: number;
    network_configurations: unknown[];
} {
    if (data && typeof data === "object" && "network_configurations" in data) {
        const o = data as Record<string, unknown>;
        const network_configurations = Array.isArray(o.network_configurations)
            ? o.network_configurations
            : [];
        const total_count =
            typeof o.total_count === "number" ? o.total_count : network_configurations.length;
        return { total_count, network_configurations };
    }
    return { total_count: 0, network_configurations: [] };
}

function toPlainNetworkConfigurations(rows: unknown[]): OrgNetworkConfigurationItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgNetworkConfigurationItem);
}

export function registerGithubListOrgNetworkConfigurationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_network_configurations",
        "List **hosted compute network configurations** for an organization (GET /orgs/{org}/settings/network-configurations). " +
            "Returns **`total_count`** and **`network_configurations`** (each with `id`, `name`, `compute_service`, `network_settings_ids`, … per GitHub). " +
            "Classic OAuth apps and PATs need **`read:network_configurations`** scope. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted), or **`all_pages`** with optional **`max_pages`**. " +
            "See [List hosted compute network configurations for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#list-hosted-compute-network-configurations-for-an-organization).",
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
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/settings/network-configurations",
                                {
                                    org: input.org,
                                    per_page: pp,
                                    page
                                }
                            );
                            const parsed = parseNetworkConfigurationsBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                            }
                            return {
                                rows: parsed.network_configurations,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const network_configurations = toPlainNetworkConfigurations(result.rows);
                    const successPayload: ListOrgNetworkConfigurationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Network configurations partially listed (${result.pagesFetched} pages, ${network_configurations.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Network configurations listed successfully (${result.pagesFetched} pages, ${network_configurations.length} rows).`
                              : "Hosted compute network configurations listed successfully.",
                        http_status: 200,
                        org: input.org,
                        total_count: firstTotalCount ?? network_configurations.length,
                        network_configurations,
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
                    "GET /orgs/{org}/settings/network-configurations",
                    {
                        org: input.org,
                        per_page: perPage,
                        page
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const parsed = parseNetworkConfigurationsBody(response.data);
                const successPayload: ListOrgNetworkConfigurationsSuccess = {
                    success: true,
                    message: "Hosted compute network configurations listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: parsed.total_count,
                    network_configurations: toPlainNetworkConfigurations(parsed.network_configurations),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgNetworkConfigurationsFailure = {
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
