import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRouteStatsByActorFailure,
    GetRouteStatsByActorSuccess,
    RouteStatsByActorRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

const actorTypeSchema = z.enum([
    "installation",
    "classic_pat",
    "fine_grained_pat",
    "oauth_app",
    "github_app_user_to_server"
]);

function toPlainRouteStatRows(rows: unknown[]): RouteStatsByActorRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as RouteStatsByActorRow);
}

async function routeStatsByActorRequest(
    octokit: Octokit,
    input: {
        org: string;
        actor_type: z.infer<typeof actorTypeSchema>;
        actor_id: number;
        min_timestamp: string;
        max_timestamp?: string;
        page: number;
        per_page: number;
        direction?: "asc" | "desc";
        api_route_substring?: string;
        sort?: string[];
    }
) {
    return octokit.request({
        method: "GET",
        url: "/orgs/{org}/insights/api/route-stats/{actor_type}/{actor_id}",
        org: input.org,
        actor_type: input.actor_type,
        actor_id: input.actor_id,
        min_timestamp: input.min_timestamp,
        ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {}),
        page: input.page,
        per_page: input.per_page,
        ...(input.direction !== undefined ? { direction: input.direction } : {}),
        ...(input.api_route_substring !== undefined ? { api_route_substring: input.api_route_substring } : {}),
        ...(input.sort !== undefined && input.sort.length > 0 ? { sort: input.sort } : {})
    });
}

export function registerGithubGetRouteStatsByActorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_route_stats_by_actor",
        "Get API request counts for an **actor** in an organization, broken down by **HTTP route** (GET /orgs/{org}/insights/api/route-stats/{actor_type}/{actor_id}). " +
            "Requires **API Insights** for the org and appropriate permissions (see GitHub). " +
            "**`min_timestamp`** is required (ISO 8601, e.g. `2025-01-01T00:00:00Z`); **`max_timestamp`** is optional (GitHub defaults per docs). " +
            "Optional filters: **`api_route_substring`**, **`direction`** (`asc` / `desc`), **`sort`** (array of sort field names), **`page`** / **`per_page`** (default **100** when omitted), or **`all_pages`** with **`max_pages`**. " +
            "See [Get route stats by actor](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-route-stats-by-actor).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            actor_type: actorTypeSchema,
            actor_id: z.number().int().min(1),
            min_timestamp: z
                .string()
                .min(1)
                .describe("ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ) — lower bound of the stats window."),
            max_timestamp: z
                .string()
                .min(1)
                .optional()
                .describe("Optional ISO 8601 upper bound; omit to use GitHub’s default window."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            sort: z.array(z.string().min(1)).max(20).optional(),
            api_route_substring: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const sortFields = input.sort?.filter((s) => s.length > 0);

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let lastHttpStatus = 200;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await routeStatsByActorRequest(octokit, {
                                org: input.org,
                                actor_type: input.actor_type,
                                actor_id: input.actor_id,
                                min_timestamp: input.min_timestamp,
                                max_timestamp: input.max_timestamp,
                                page,
                                per_page: pp,
                                direction: input.direction,
                                api_route_substring: input.api_route_substring,
                                sort: sortFields
                            });
                            lastHttpStatus = response.status;
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
                    const route_stats = toPlainRouteStatRows(result.rows);
                    const successPayload: GetRouteStatsByActorSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Route stats partially fetched (${result.pagesFetched} pages, ${route_stats.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Route stats fetched successfully (${result.pagesFetched} pages, ${route_stats.length} rows).`
                              : "Route stats fetched successfully.",
                        http_status: lastHttpStatus,
                        org: input.org,
                        actor_type: input.actor_type,
                        actor_id: input.actor_id,
                        min_timestamp: input.min_timestamp,
                        max_timestamp: input.max_timestamp ?? null,
                        route_stats,
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
                const response = await routeStatsByActorRequest(octokit, {
                    org: input.org,
                    actor_type: input.actor_type,
                    actor_id: input.actor_id,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp,
                    page,
                    per_page: perPage,
                    direction: input.direction,
                    api_route_substring: input.api_route_substring,
                    sort: sortFields
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: GetRouteStatsByActorSuccess = {
                    success: true,
                    message: "Route stats fetched successfully.",
                    http_status: response.status,
                    org: input.org,
                    actor_type: input.actor_type,
                    actor_id: input.actor_id,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    route_stats: toPlainRouteStatRows(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRouteStatsByActorFailure = {
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
