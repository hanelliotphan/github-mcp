import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListEnterpriseCostCentersFailure,
    ListEnterpriseCostCentersSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubListEnterpriseCostCentersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_enterprise_cost_centers",
        "List all cost centers for an enterprise (GET /enterprises/{enterprise}/settings/billing/cost-centers). " +
            "Optional **state** filter: `active` or `deleted`. Requires enterprise owner, billing manager, or organization owner. " +
            "See [Get all cost centers for an enterprise](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10#get-all-cost-centers-for-an-enterprise).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    enterpriseSlugRegex,
                    "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"
                ),
            state: z.enum(["active", "deleted"]).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /enterprises/{enterprise}/settings/billing/cost-centers",
                    {
                        enterprise: input.enterprise,
                        ...(input.state ? { state: input.state } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = toPlain(response.data);
                const costCenters = Array.isArray(data.costCenters)
                    ? (data.costCenters as unknown[]).map((r) => toPlain(r))
                    : Array.isArray(response.data)
                      ? (response.data as unknown[]).map((r) => toPlain(r))
                      : [];
                const successPayload: ListEnterpriseCostCentersSuccess = {
                    success: true,
                    message: "Cost centers listed successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    cost_centers: costCenters,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListEnterpriseCostCentersFailure = {
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
