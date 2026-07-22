import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgBillingUsageSummaryFailure,
    GetOrgBillingUsageSummarySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetOrgBillingUsageSummaryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_billing_usage_summary",
        "Get billing usage summary for an organization (GET /organizations/{org}/settings/billing/usage/summary). " +
            "Public preview. Only the past 24 months are available. Optional filters: repository, product, sku. " +
            "See [Get billing usage summary for an organization](https://docs.github.com/en/rest/billing/usage?apiVersion=2026-03-10#get-billing-usage-summary-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(loginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            year: z.number().int().min(2000).max(2100).optional(),
            month: z.number().int().min(1).max(12).optional(),
            day: z.number().int().min(1).max(31).optional(),
            repository: z.string().min(1).optional().describe("owner/repository"),
            product: z.string().min(1).optional(),
            sku: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /organizations/{org}/settings/billing/usage/summary",
                    {
                        org: input.org,
                        ...(input.year !== undefined ? { year: input.year } : {}),
                    ...(input.month !== undefined ? { month: input.month } : {}),
                    ...(input.day !== undefined ? { day: input.day } : {}),
                        ...(input.repository ? { repository: input.repository } : {}),
                        ...(input.product ? { product: input.product } : {}),
                        ...(input.sku ? { sku: input.sku } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgBillingUsageSummarySuccess = {
                    success: true,
                    message: "Billing usage retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    usage: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgBillingUsageSummaryFailure = {
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
