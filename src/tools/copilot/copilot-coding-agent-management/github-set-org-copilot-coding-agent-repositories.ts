import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetOrgCopilotCodingAgentRepositoriesSuccess, SetOrgCopilotCodingAgentRepositoriesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetOrgCopilotCodingAgentRepositoriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_copilot_coding_agent_repositories",
        "Replace selected repositories enabled for Copilot cloud agent (PUT /orgs/{org}/copilot/coding-agent/permissions/repositories). selected_repository_ids required. Organization policy must be selected. Returns HTTP 204. See [Set selected repositories for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#set-selected-repositories-for-copilot-cloud-agent-in-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            selected_repository_ids: z.array(z.number().int().positive()).min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/copilot/coding-agent/permissions/repositories",
                    {
                        org: input.org,
                    selected_repository_ids: input.selected_repository_ids
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetOrgCopilotCodingAgentRepositoriesSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    org: input.org,
                    selected_repository_ids: input.selected_repository_ids,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgCopilotCodingAgentRepositoriesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
