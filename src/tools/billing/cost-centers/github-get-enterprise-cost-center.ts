import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetEnterpriseCostCenterFailure,
    GetEnterpriseCostCenterSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetEnterpriseCostCenterTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_enterprise_cost_center",
        "Get a cost center by ID (GET /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}). " +
            "See [Get a cost center by ID](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10#get-a-cost-center-by-id).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    enterpriseSlugRegex,
                    "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"
                ),
            cost_center_id: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}",
                    { enterprise: input.enterprise, cost_center_id: input.cost_center_id }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetEnterpriseCostCenterSuccess = {
                    success: true,
                    message: "Cost center retrieved successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    cost_center_id: input.cost_center_id,
                    cost_center: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetEnterpriseCostCenterFailure = {
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
