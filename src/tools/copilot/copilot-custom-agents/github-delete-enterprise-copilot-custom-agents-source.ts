import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteEnterpriseCopilotCustomAgentsSourceSuccess, DeleteEnterpriseCopilotCustomAgentsSourceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubDeleteEnterpriseCopilotCustomAgentsSourceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_enterprise_copilot_custom_agents_source",
        "Delete the custom agents source for an enterprise (DELETE /enterprises/{enterprise}/copilot/custom-agents/source). Returns HTTP 204. See [Delete the custom agents source for an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#delete-the-custom-agents-source-for-an-enterprise).",
        {
            enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /enterprises/{enterprise}/copilot/custom-agents/source",
                    {
                        enterprise: input.enterprise
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteEnterpriseCopilotCustomAgentsSourceSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    enterprise: input.enterprise,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteEnterpriseCopilotCustomAgentsSourceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
