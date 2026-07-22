import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AddEnterpriseCopilotCodingAgentOrganizationsSuccess, AddEnterpriseCopilotCodingAgentOrganizationsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubAddEnterpriseCopilotCodingAgentOrganizationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_enterprise_copilot_coding_agent_organizations",
        "Add organizations to the enterprise Copilot cloud agent policy (POST /enterprises/{enterprise}/copilot/policies/coding_agent/organizations). Enterprise policy must be enabled_for_selected_orgs. Optional organizations (logins) and/or custom_properties filters. Returns HTTP 204. See [Add organizations to the enterprise coding agent policy](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#add-organizations-to-the-enterprise-coding-agent-policy).",
        {
            enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            organizations: z.array(z.string().min(1)).optional().optional(),
            custom_properties: z.array(z.object({ property_name: z.string().min(1), values: z.array(z.string().min(1)).min(1) })).optional().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /enterprises/{enterprise}/copilot/policies/coding_agent/organizations",
                    {
                        enterprise: input.enterprise,
                    ...(input.organizations !== undefined ? { organizations: input.organizations } : {}),
                    ...(input.custom_properties !== undefined ? { custom_properties: input.custom_properties } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddEnterpriseCopilotCodingAgentOrganizationsSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    enterprise: input.enterprise,
                    organizations: input.organizations,
                    custom_properties: input.custom_properties,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddEnterpriseCopilotCodingAgentOrganizationsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
