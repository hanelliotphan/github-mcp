import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveResourcesFromEnterpriseCostCenterFailure,
    RemoveResourcesFromEnterpriseCostCenterSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubRemoveResourcesFromEnterpriseCostCenterTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_resources_from_enterprise_cost_center",
        "Remove resources from a cost center (DELETE /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}/resource). " +
            "Requires enterprise admin. Pass one or more of users, organizations, repositories, enterprise_teams. " +
            "See [Remove resources from a cost center](https://docs.github.com/en/rest/billing/cost-centers?apiVersion=2026-03-10#remove-resources-from-a-cost-center).",
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
            users: z.array(z.string().min(1)).optional().describe("Usernames to add/remove."),
            organizations: z.array(z.string().min(1)).optional(),
            repositories: z.array(z.string().min(1)).optional().describe("Repository names (owner/repo)."),
            enterprise_teams: z.array(z.string().min(1)).optional()
        },
        async (input) => {
            try {
                const body = {
                    ...(input.users ? { users: input.users } : {}),
                    ...(input.organizations ? { organizations: input.organizations } : {}),
                    ...(input.repositories ? { repositories: input.repositories } : {}),
                    ...(input.enterprise_teams ? { enterprise_teams: input.enterprise_teams } : {})
                };
                const response = await octokit.request(
                    "DELETE /enterprises/{enterprise}/settings/billing/cost-centers/{cost_center_id}/resource",
                    { enterprise: input.enterprise, cost_center_id: input.cost_center_id, ...body }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveResourcesFromEnterpriseCostCenterSuccess = {
                    success: true,
                    message: "Resources removed from cost center successfully.",
                    http_status: response.status,
                    enterprise: input.enterprise,
                    cost_center_id: input.cost_center_id,
                    result: toPlain(response.data ?? {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveResourcesFromEnterpriseCostCenterFailure = {
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
