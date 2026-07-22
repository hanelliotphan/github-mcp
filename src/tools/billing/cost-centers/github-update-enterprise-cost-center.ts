import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateEnterpriseCostCenterFailure,
    UpdateEnterpriseCostCenterSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUpdateEnterpriseCostCenterTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_enterprise_cost_center",
        "Update a cost center name (PATCH /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}). " +
            "See [Update a cost center name](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10#update-a-cost-center-name).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    enterpriseSlugRegex,
                    "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"
                ),
            cost_center_id: z.string().min(1),
            name: z.string().min(1).max(255),
            ai_credit_pool_enabled: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}",
                    {
                        enterprise: input.enterprise,
                        cost_center_id: input.cost_center_id,
                        name: input.name,
                        ...(input.ai_credit_pool_enabled !== undefined
                            ? { ai_credit_pool_enabled: input.ai_credit_pool_enabled }
                            : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateEnterpriseCostCenterSuccess = {
                    success: true,
                    message: "Cost center updated successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    cost_center_id: input.cost_center_id,
                    cost_center: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateEnterpriseCostCenterFailure = {
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
