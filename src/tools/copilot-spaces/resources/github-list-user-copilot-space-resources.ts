import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserCopilotSpaceResourcesSuccess, ListUserCopilotSpaceResourcesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function getResources(data: unknown): Record<string, unknown>[] {
    if (data && typeof data === "object" && "resources" in data) {
        const rows = (data as { resources?: unknown }).resources;
        return Array.isArray(rows) ? rows.map((row) => toPlain(row)) : [];
    }
    return [];
}

export function registerGithubListUserCopilotSpaceResourcesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_copilot_space_resources",
        "List resources for a user Copilot Space (GET /users/{username}/copilot-spaces/{space_number}/resources). Returns resources array. See [List resources for a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/resources?apiVersion=2026-03-10#list-resources-for-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /users/{username}/copilot-spaces/{space_number}/resources", { username: input.username, space_number: input.space_number } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListUserCopilotSpaceResourcesSuccess = {
                    success: true,
                    message: "Resources listed successfully.",
                    username: input.username,
                    space_number: input.space_number,
                    resources: getResources(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserCopilotSpaceResourcesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
