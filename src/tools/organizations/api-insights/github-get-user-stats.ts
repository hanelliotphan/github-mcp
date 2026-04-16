import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetUserStatsFailure, GetUserStatsSuccess, UserStatRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlainUserStatRows(rows: unknown[]): UserStatRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as UserStatRow);
}

async function userStatsRequest(
    octokit: Octokit,
    input: {
        org: string;
        user_id: string;
        min_timestamp: string;
        max_timestamp?: string;
        page: number;
        per_page: number;
        direction?: "asc" | "desc";
        actor_name_substring?: string;
        sort?: string[];
    }
) {
    return octokit.request({
        method: "GET",
        url: "/orgs/{org}/insights/api/user-stats/{user_id}",
        org: input.org,
        user_id: input.user_id,
        min_timestamp: input.min_timestamp,
        ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {}),
        page: input.page,
        per_page: input.per_page,
        ...(input.direction !== undefined ? { direction: input.direction } : {}),
        ...(input.actor_name_substring !== undefined ? { actor_name_substring: input.actor_name_substring } : {}),
        ...(input.sort !== undefined && input.sort.length > 0 ? { sort: input.sort } : {})
    });
}

export function registerGithubGetUserStatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_stats",
        "Get API usage for one **user** in an organization, broken down by **access type / actor** (GET /orgs/{org}/insights/api/user-stats/{user_id}). " +
            "Each row includes **`actor_type`**, **`actor_name`**, **`actor_id`**, request counts, and timestamps per GitHub. " +
            "Requires **API Insights**. **`min_timestamp`** is required (ISO 8601); **`max_timestamp`** is optional. " +
            "Optional **`actor_name_substring`**, **`direction`**, **`sort`**, **`page`** / **`per_page`** (default **100** when omitted), or **`all_pages`** with **`max_pages`**. " +
            "See [Get user stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-user-stats).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            user_id: z
                .union([z.string().min(1), z.number().int().positive()])
                .transform((v) => String(v))
                .describe("GitHub numeric user id for the path segment."),
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
            actor_name_substring: z.string().min(1).optional(),
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
                            const response = await userStatsRequest(octokit, {
                                org: input.org,
                                user_id: input.user_id,
                                min_timestamp: input.min_timestamp,
                                max_timestamp: input.max_timestamp,
                                page,
                                per_page: pp,
                                direction: input.direction,
                                actor_name_substring: input.actor_name_substring,
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
                    const user_stats = toPlainUserStatRows(result.rows);
                    const successPayload: GetUserStatsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `User stats partially fetched (${result.pagesFetched} pages, ${user_stats.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `User stats fetched successfully (${result.pagesFetched} pages, ${user_stats.length} rows).`
                              : "User stats fetched successfully.",
                        http_status: lastHttpStatus,
                        org: input.org,
                        user_id: input.user_id,
                        min_timestamp: input.min_timestamp,
                        max_timestamp: input.max_timestamp ?? null,
                        user_stats,
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
                const response = await userStatsRequest(octokit, {
                    org: input.org,
                    user_id: input.user_id,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp,
                    page,
                    per_page: perPage,
                    direction: input.direction,
                    actor_name_substring: input.actor_name_substring,
                    sort: sortFields
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: GetUserStatsSuccess = {
                    success: true,
                    message: "User stats fetched successfully.",
                    http_status: response.status,
                    org: input.org,
                    user_id: input.user_id,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    user_stats: toPlainUserStatRows(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserStatsFailure = {
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
