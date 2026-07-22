import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateEnterpriseUsageReportExportFailure,
    CreateEnterpriseUsageReportExportSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCreateEnterpriseUsageReportExportTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_enterprise_usage_report_export",
        "Create a usage report export for an enterprise (POST /enterprises/{enterprise}/settings/billing/reports). " +
            "Returns **202** when accepted; poll with `github_get_enterprise_usage_report_export`. " +
            "Requires enterprise admin or billing manager. " +
            "See [Create a usage report export](https://docs.github.com/en/rest/billing/usage-reports?apiVersion=2026-03-10#create-a-usage-report-export).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(loginRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            report_type: z.enum(["detailed", "summarized", "premium_request", "ai_credit"]),
            start_date: z.string().min(1).describe("YYYY-MM-DD"),
            end_date: z.string().min(1).optional().describe("YYYY-MM-DD; defaults to today UTC"),
            send_email: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /enterprises/{enterprise}/settings/billing/reports",
                    {
                        enterprise: input.enterprise,
                        report_type: input.report_type,
                        start_date: input.start_date,
                        ...(input.end_date ? { end_date: input.end_date } : {}),
                        ...(input.send_email !== undefined ? { send_email: input.send_email } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateEnterpriseUsageReportExportSuccess = {
                    success: true,
                    message: "Usage report export requested successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    report: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateEnterpriseUsageReportExportFailure = {
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
