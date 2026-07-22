import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetEnterpriseUsageReportExportFailure,
    GetEnterpriseUsageReportExportSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetEnterpriseUsageReportExportTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_enterprise_usage_report_export",
        "Get a usage report export by ID (GET /enterprises/{enterprise}/settings/billing/reports/{report_id}). " +
            "Requires enterprise admin or billing manager. " +
            "See [Get a usage report export](https://docs.github.com/en/rest/billing/usage-reports?apiVersion=2026-03-10#get-a-usage-report-export).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(loginRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            report_id: z.string().min(1).describe("UUID of the usage report export")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /enterprises/{enterprise}/settings/billing/reports/{report_id}",
                    { enterprise: input.enterprise, report_id: input.report_id }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetEnterpriseUsageReportExportSuccess = {
                    success: true,
                    message: "Usage report export retrieved successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    report_id: input.report_id,
                    report: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetEnterpriseUsageReportExportFailure = {
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
