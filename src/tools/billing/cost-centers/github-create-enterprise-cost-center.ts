import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateEnterpriseCostCenterFailure,
    CreateEnterpriseCostCenterSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCreateEnterpriseCostCenterTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_enterprise_cost_center",
        "Create a cost center for an enterprise (POST /enterprises/{enterprise}/settings/billing/cost-centers). " +
            "Requires enterprise admin. " +
            "See [Create a new cost center](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10#create-a-new-cost-center).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    enterpriseSlugRegex,
                    "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z.string().min(1).max(255),
            ai_credit_pool_enabled: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /enterprises/{enterprise}/settings/billing/cost-centers",
                    {
                        enterprise: input.enterprise,
                        name: input.name,
                        ...(input.ai_credit_pool_enabled !== undefined
                            ? { ai_credit_pool_enabled: input.ai_credit_pool_enabled }
                            : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateEnterpriseCostCenterSuccess = {
                    success: true,
                    message: "Cost center created successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    cost_center: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateEnterpriseCostCenterFailure = {
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
