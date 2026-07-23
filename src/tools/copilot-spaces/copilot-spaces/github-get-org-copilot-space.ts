import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotSpaceSuccess, GetOrgCopilotSpaceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCopilotSpaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_space",
        "Get an organization Copilot Space (GET /orgs/{org}/copilot-spaces/{space_number}). See [Get an organization Copilot Space](https://docs.github.com/en/rest/copilot-spaces/copilot-spaces?apiVersion=2026-03-10#get-an-organization-copilot-space).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /orgs/{org}/copilot-spaces/{space_number}", { org: input.org, space_number: input.space_number } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotSpaceSuccess = {
                    success: true,
                    message: "Copilot Space retrieved successfully.",
                    org: input.org,
                    space_number: input.space_number,
                    space: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotSpaceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
