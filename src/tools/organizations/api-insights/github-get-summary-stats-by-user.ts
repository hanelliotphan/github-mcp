import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetSummaryStatsByUserFailure,
    GetSummaryStatsByUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainSummaryStats(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetSummaryStatsByUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_summary_stats_by_user",
        "Get API request **summary** totals for one **user** in an organization (GET /orgs/{org}/insights/api/summary-stats/users/{user_id}). " +
            "Same response shape as org-wide summary stats (**`total_request_count`**, **`rate_limited_request_count`**, …). " +
            "**`user_id`** is the numeric GitHub user id (as in the REST path; pass a string or digits only). " +
            "Requires **API Insights**. **`min_timestamp`** is required (ISO 8601); **`max_timestamp`** is optional. " +
            "See [Get summary stats by user](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-summary-stats-by-user).",
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
                .describe("Optional ISO 8601 upper bound; omit to use GitHub’s default window.")
        },
        async (input) => {
            try {
                const response = await octokit.request({
                    method: "GET",
                    url: "/orgs/{org}/insights/api/summary-stats/users/{user_id}",
                    org: input.org,
                    user_id: input.user_id,
                    min_timestamp: input.min_timestamp,
                    ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetSummaryStatsByUserSuccess = {
                    success: true,
                    message: "Summary stats for user retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    user_id: input.user_id,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    summary_stats: toPlainSummaryStats(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetSummaryStatsByUserFailure = {
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
