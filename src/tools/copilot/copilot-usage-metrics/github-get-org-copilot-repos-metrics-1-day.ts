import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotReposMetrics1DaySuccess, GetOrgCopilotReposMetrics1DayFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCopilotReposMetrics1DayTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_repos_metrics_1_day",
        "Get Copilot organization repository metrics download links for a specific day (GET /orgs/{org}/copilot/metrics/reports/repos-1-day). day (YYYY-MM-DD) required. See [Get Copilot organization repository report for a specific day](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-repository-report-for-a-specific-day).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "day must be YYYY-MM-DD")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/copilot/metrics/reports/repos-1-day",
                    {
                        org: input.org,
                    day: input.day
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotReposMetrics1DaySuccess = {
                    success: true,
                    message: "Copilot metrics report links retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    day: input.day,
                    report: JSON.parse(JSON.stringify(response.data ?? {})) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotReposMetrics1DayFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
