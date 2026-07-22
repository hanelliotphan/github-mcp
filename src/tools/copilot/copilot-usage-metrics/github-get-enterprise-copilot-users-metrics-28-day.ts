import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetEnterpriseCopilotUsersMetrics28DaySuccess, GetEnterpriseCopilotUsersMetrics28DayFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetEnterpriseCopilotUsersMetrics28DayTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_enterprise_copilot_users_metrics_28_day",
        "Get latest 28-day Copilot enterprise users metrics download links (GET /enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest). See [Get Copilot enterprise users metrics](https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-users-metrics).",
        {
            enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest",
                    {
                        enterprise: input.enterprise
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetEnterpriseCopilotUsersMetrics28DaySuccess = {
                    success: true,
                    message: "Copilot metrics report links retrieved successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    report: JSON.parse(JSON.stringify(response.data ?? {})) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetEnterpriseCopilotUsersMetrics28DayFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
