import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoCommitActivityStatsFailure,
    GetRepoCommitActivityStatsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row ?? {})) as Record<string, unknown>);
}

function statsMessage(status: number): string {
    if (status === 202) {
        return "Commit activity statistics are being computed; retry shortly.";
    }
    if (status === 204) {
        return "No commit activity statistics content returned.";
    }
    return "Commit activity statistics retrieved successfully.";
}

export function registerGithubGetRepoCommitActivityStatsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_repo_commit_activity_stats",
        "Get the last year of commit activity by week (GET /repos/{owner}/{repo}/stats/commit_activity). " +
            "**202** means stats are still computing (retry); **204** means no content. " +
            "See [Get the last year of commit activity](https://docs.github.com/en/rest/metrics/statistics?apiVersion=2026-03-10#get-the-last-year-of-commit-activity).",
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
                const response = await octokit.rest.repos.getCommitActivityStats({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const status = response.status as number;
                const successPayload: GetRepoCommitActivityStatsSuccess = {
                    success: true,
                    message: statsMessage(status),
                    http_status: status,
                    owner: input.owner,
                    name: input.name,
                    commit_activity:
                        status === 200 && Array.isArray(response.data)
                            ? toPlainRows(response.data)
                            : null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoCommitActivityStatsFailure = {
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
