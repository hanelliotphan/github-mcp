import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetEnterpriseCopilotCodingAgentPolicySuccess, SetEnterpriseCopilotCodingAgentPolicyFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetEnterpriseCopilotCodingAgentPolicyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_enterprise_copilot_coding_agent_policy",
        "Set the Copilot cloud agent policy for an enterprise (PUT /enterprises/{enterprise}/copilot/policies/coding_agent). policy_state required: enabled_for_all_orgs, disabled_for_all_orgs, enabled_for_selected_orgs, or configured_by_org_admins. Returns HTTP 204. See [Set the coding agent policy for an enterprise](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#set-the-coding-agent-policy-for-an-enterprise).",
        {
            enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            policy_state: z.enum(["enabled_for_all_orgs", "disabled_for_all_orgs", "enabled_for_selected_orgs", "configured_by_org_admins"])
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /enterprises/{enterprise}/copilot/policies/coding_agent",
                    {
                        enterprise: input.enterprise,
                    policy_state: input.policy_state
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetEnterpriseCopilotCodingAgentPolicySuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    enterprise: input.enterprise,
                    policy_state: input.policy_state,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetEnterpriseCopilotCodingAgentPolicyFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
