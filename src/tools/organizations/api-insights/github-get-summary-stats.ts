import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetSummaryStatsFailure, GetSummaryStatsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainSummaryStats(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetSummaryStatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_summary_stats",
        "Get organization-wide API request **summary** totals for a time window (GET /orgs/{org}/insights/api/summary-stats). " +
            "The JSON body typically includes **`total_request_count`** and **`rate_limited_request_count`** (see GitHub). " +
            "Requires **API Insights** for the org. **`min_timestamp`** is required (ISO 8601); **`max_timestamp`** is optional. " +
            "See [Get summary stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-summary-stats).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
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
                    url: "/orgs/{org}/insights/api/summary-stats",
                    org: input.org,
                    min_timestamp: input.min_timestamp,
                    ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetSummaryStatsSuccess = {
                    success: true,
                    message: "Summary stats retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    summary_stats: toPlainSummaryStats(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetSummaryStatsFailure = {
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
