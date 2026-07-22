import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotCodingAgentPermissionsSuccess, GetOrgCopilotCodingAgentPermissionsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCopilotCodingAgentPermissionsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_coding_agent_permissions",
        "Get Copilot cloud agent repository permissions for an organization (GET /orgs/{org}/copilot/coding-agent/permissions). Public preview. Returns enabled_repositories (all|selected|none) and selected_repositories_url. See [Get Copilot cloud agent permissions for an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#get-copilot-cloud-agent-permissions-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/copilot/coding-agent/permissions",
                    {
                        org: input.org
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotCodingAgentPermissionsSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    org: input.org,
                    permissions: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotCodingAgentPermissionsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
