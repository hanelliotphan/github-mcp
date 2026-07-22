import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserPremiumRequestBillingUsageFailure,
    GetUserPremiumRequestBillingUsageSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetUserPremiumRequestBillingUsageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_premium_request_billing_usage",
        "Get premium request billing usage for a user (GET /users/{username}/settings/billing/premium_request/usage). " +
            "See [Get billing premium request usage report for a user](https://docs.github.com/en/rest/billing/usage?apiVersion=2026-03-10#get-billing-premium-request-usage-report-for-a-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(loginRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            year: z.number().int().min(2000).max(2100).optional(),
            month: z.number().int().min(1).max(12).optional(),
            day: z.number().int().min(1).max(31).optional(),
            model: z.string().min(1).optional(),
            product: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /users/{username}/settings/billing/premium_request/usage",
                    {
                        username: input.username,
                        ...(input.year !== undefined ? { year: input.year } : {}),
                    ...(input.month !== undefined ? { month: input.month } : {}),
                    ...(input.day !== undefined ? { day: input.day } : {}),
                        ...(input.model ? { model: input.model } : {}),
                        ...(input.product ? { product: input.product } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserPremiumRequestBillingUsageSuccess = {
                    success: true,
                    message: "Billing usage retrieved successfully.",
                    http_status: response.status,
                    username: input.username,
                    usage: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserPremiumRequestBillingUsageFailure = {
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
