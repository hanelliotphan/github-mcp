import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotUsersMetrics28DaySuccess, GetOrgCopilotUsersMetrics28DayFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCopilotUsersMetrics28DayTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_users_metrics_28_day",
        "Get latest 28-day Copilot organization users metrics download links (GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest). See [Get Copilot organization users metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-organization-users-metrics).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest",
                    {
                        org: input.org
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotUsersMetrics28DaySuccess = {
                    success: true,
                    message: "Copilot metrics report links retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    report: JSON.parse(JSON.stringify(response.data ?? {})) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotUsersMetrics28DayFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
