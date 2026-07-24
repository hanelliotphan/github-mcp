import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoPunchCardStatsFailure,
    GetRepoPunchCardStatsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toJson(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data ?? null));
}

function statsMessage(status: number): string {
    if (status === 204) {
        return "No punch card statistics content returned.";
    }
    return "Punch card statistics retrieved successfully.";
}

export function registerGithubGetRepoPunchCardStatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_punch_card_stats",
        "Get hourly commit counts for each day of the week (GET /repos/{owner}/{repo}/stats/punch_card). " +
            "Each row is `[day, hour, commits]` (day 0–6 Sun–Sat, hour 0–23). **204** means no content. " +
            "See [Get the hourly commit count for each day](https://docs.github.com/en/rest/metrics/statistics?apiVersion=2026-03-10#get-the-hourly-commit-count-for-each-day).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getPunchCardStats({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const status = response.status as number;
                const successPayload: GetRepoPunchCardStatsSuccess = {
                    success: true,
                    message: statsMessage(status),
                    http_status: status,
                    owner: input.owner,
                    name: input.name,
                    punch_card: status === 200 ? toJson(response.data) : null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoPunchCardStatsFailure = {
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
