import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetTimeStatsFailure, GetTimeStatsSuccess, TimeStatRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainTimeStatRows(data: unknown): TimeStatRow[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => JSON.parse(JSON.stringify(row)) as TimeStatRow);
}

export function registerGithubGetOrgTimeStatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_time_stats",
        "Get org-wide API request counts **over time** in buckets (GET /orgs/{org}/insights/api/time-stats). " +
            "Each row includes **`timestamp`**, **`total_request_count`**, **`rate_limited_request_count`** (see GitHub). " +
            "Requires **API Insights**. **`min_timestamp`** and **`timestamp_increment`** are required (increment examples: **`5m`**, **`10m`**, **`1h`** per GitHub). " +
            "Optional **`max_timestamp`**. " +
            "See [Get time stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-time-stats).",
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
                .describe("Optional ISO 8601 upper bound; omit to use GitHub’s default window."),
            timestamp_increment: z
                .string()
                .min(1)
                .describe("Bucket size for the series (GitHub examples: 5m, 10m, 1h).")
        },
        async (input) => {
            try {
                const response = await octokit.request({
                    method: "GET",
                    url: "/orgs/{org}/insights/api/time-stats",
                    org: input.org,
                    min_timestamp: input.min_timestamp,
                    timestamp_increment: input.timestamp_increment,
                    ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetTimeStatsSuccess = {
                    success: true,
                    message: "Time stats retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    timestamp_increment: input.timestamp_increment,
                    time_stats: toPlainTimeStatRows(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetTimeStatsFailure = {
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
