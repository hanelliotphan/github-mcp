import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetEnterpriseCopilotCustomAgentsSourceSuccess, SetEnterpriseCopilotCustomAgentsSourceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetEnterpriseCopilotCustomAgentsSourceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_enterprise_copilot_custom_agents_source",
        "Set the source organization for custom agents in an enterprise (PUT /enterprises/{enterprise}/copilot/custom-agents/source). organization_id required; create_ruleset optional (default true). See [Set the source organization for custom agents in an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#set-the-source-organization-for-custom-agents-in-an-enterprise).",
        {
            enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            organization_id: z.number().int().positive(),
            create_ruleset: z.boolean().optional().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /enterprises/{enterprise}/copilot/custom-agents/source",
                    {
                        enterprise: input.enterprise,
                    organization_id: input.organization_id,
                    ...(input.create_ruleset !== undefined ? { create_ruleset: input.create_ruleset } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetEnterpriseCopilotCustomAgentsSourceSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    organization_id: input.organization_id,
                    create_ruleset: input.create_ruleset,
                    source: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetEnterpriseCopilotCustomAgentsSourceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
