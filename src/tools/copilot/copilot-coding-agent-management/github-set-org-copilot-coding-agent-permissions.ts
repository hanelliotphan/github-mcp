import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetOrgCopilotCodingAgentPermissionsSuccess, SetOrgCopilotCodingAgentPermissionsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetOrgCopilotCodingAgentPermissionsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_copilot_coding_agent_permissions",
        "Set Copilot cloud agent repository permissions for an organization (PUT /orgs/{org}/copilot/coding-agent/permissions). enabled_repositories required: all, selected, or none. Returns HTTP 204. See [Set Copilot cloud agent permissions for an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#set-copilot-cloud-agent-permissions-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            enabled_repositories: z.enum(["all", "selected", "none"])
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/copilot/coding-agent/permissions",
                    {
                        org: input.org,
                    enabled_repositories: input.enabled_repositories
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetOrgCopilotCodingAgentPermissionsSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    org: input.org,
                    enabled_repositories: input.enabled_repositories,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgCopilotCodingAgentPermissionsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
