import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListEnterpriseUsageReportExportsFailure,
    ListEnterpriseUsageReportExportsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubListEnterpriseUsageReportExportsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_enterprise_usage_report_exports",
        "List usage report exports for an enterprise (GET /enterprises/{enterprise}/settings/billing/reports). " +
            "Requires enterprise admin or billing manager. " +
            "See [List usage report exports](https://docs.github.com/en/rest/billing/usage-reports?apiVersion=2026-03-10#list-usage-report-exports).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(loginRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /enterprises/{enterprise}/settings/billing/reports",
                    { enterprise: input.enterprise }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = toPlain(response.data);
                const exports = Array.isArray(data.usage_report_exports)
                    ? (data.usage_report_exports as unknown[]).map((r) => toPlain(r))
                    : [];
                const successPayload: ListEnterpriseUsageReportExportsSuccess = {
                    success: true,
                    message: "Usage report exports listed successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    usage_report_exports: exports,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListEnterpriseUsageReportExportsFailure = {
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
