import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteEnterpriseCostCenterFailure,
    DeleteEnterpriseCostCenterSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubDeleteEnterpriseCostCenterTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_enterprise_cost_center",
        "Archive/delete a cost center (DELETE /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}). " +
            "Requires enterprise admin. " +
            "See [Delete a cost center](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10#delete-a-cost-center).",
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
                    "DELETE /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}",
                    { enterprise: input.enterprise, cost_center_id: input.cost_center_id }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteEnterpriseCostCenterSuccess = {
                    success: true,
                    message: "Cost center archived successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    cost_center_id: input.cost_center_id,
                    result: toPlain(response.data ?? { cost_center_id: input.cost_center_id }),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteEnterpriseCostCenterFailure = {
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
