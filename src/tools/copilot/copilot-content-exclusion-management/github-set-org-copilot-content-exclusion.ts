import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetOrgCopilotContentExclusionSuccess, SetOrgCopilotContentExclusionFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetOrgCopilotContentExclusionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_copilot_content_exclusion",
        "Set Copilot content exclusion rules for an organization (PUT /orgs/{org}/copilot/content_exclusion). rules is a map of repository name to path arrays; sent as the JSON request body. See [Set Copilot content exclusion rules for an organization](https://docs.github.com/en/rest/copilot/copilot-content-exclusion-management?apiVersion=2026-03-10#set-copilot-content-exclusion-rules-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            rules: z.record(z.string(), z.array(z.string()))
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/copilot/content_exclusion",
                    {
                        org: input.org,
                        ...input.rules
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data && typeof response.data === "object" ? toPlain(response.data) : undefined;
                const successPayload: SetOrgCopilotContentExclusionSuccess = {
                    success: true,
                    message: "Copilot content exclusion rules updated successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    rules: input.rules,
                    ...(data ? { result: data } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgCopilotContentExclusionFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
