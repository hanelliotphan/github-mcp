import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { EnableOrgCopilotCodingAgentRepositorySuccess, EnableOrgCopilotCodingAgentRepositoryFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubEnableOrgCopilotCodingAgentRepositoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_enable_org_copilot_coding_agent_repository",
        "Enable a repository for Copilot cloud agent in an organization (PUT /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}). Organization policy must be selected. Returns HTTP 204. See [Enable a repository for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#enable-a-repository-for-copilot-cloud-agent-in-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            repository_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/copilot/coding-agent/permissions/repositories/{repository_id}",
                    {
                        org: input.org,
                    repository_id: input.repository_id
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: EnableOrgCopilotCodingAgentRepositorySuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    org: input.org,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: EnableOrgCopilotCodingAgentRepositoryFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
