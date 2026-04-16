import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetTimeStatsByActorFailure,
    GetTimeStatsByActorSuccess,
    TimeStatRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const actorTypeSchema = z.enum([
    "installation",
    "classic_pat",
    "fine_grained_pat",
    "oauth_app",
    "github_app_user_to_server"
]);

function toPlainTimeStatRows(data: unknown): TimeStatRow[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => JSON.parse(JSON.stringify(row)) as TimeStatRow);
}

export function registerGithubGetTimeStatsByActorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_time_stats_by_actor",
        "Get API request counts **over time** for one **actor** in an organization (GET /orgs/{org}/insights/api/time-stats/{actor_type}/{actor_id}). " +
            "Same row shape as org-wide [time stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-time-stats) (**`timestamp`**, **`total_request_count`**, **`rate_limited_request_count`**, …). " +
            "**`actor_type`** and **`actor_id`** identify the actor (e.g. GitHub App **installation** id). " +
            "Requires **API Insights**. **`min_timestamp`** and **`timestamp_increment`** are required; optional **`max_timestamp`**. " +
            "See [Get time stats by actor](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-time-stats-by-actor).",
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
            timestamp_increment: z
                .string()
                .min(1)
                .describe("Bucket size for the series (GitHub examples: 5m, 10m, 1h).")
        },
        async (input) => {
            try {
                const response = await octokit.request({
                    method: "GET",
                    url: "/orgs/{org}/insights/api/time-stats/{actor_type}/{actor_id}",
                    org: input.org,
                    actor_type: input.actor_type,
                    actor_id: input.actor_id,
                    min_timestamp: input.min_timestamp,
                    timestamp_increment: input.timestamp_increment,
                    ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetTimeStatsByActorSuccess = {
                    success: true,
                    message: "Time stats for actor retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    actor_type: input.actor_type,
                    actor_id: input.actor_id,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    timestamp_increment: input.timestamp_increment,
                    time_stats: toPlainTimeStatRows(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetTimeStatsByActorFailure = {
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
