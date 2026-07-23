import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetUserCopilotSpaceResourceSuccess, GetUserCopilotSpaceResourceFailure } from "../../../types.js";
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

export function registerGithubGetUserCopilotSpaceResourceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_copilot_space_resource",
        "Get a resource for a user Copilot Space (GET /users/{username}/copilot-spaces/{space_number}/resources/{space_resource_id}). See [Get a resource for a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/resources?apiVersion=2026-03-10#get-a-resource-for-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            space_resource_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /users/{username}/copilot-spaces/{space_number}/resources/{space_resource_id}", { username: input.username, space_number: input.space_number, space_resource_id: input.space_resource_id } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserCopilotSpaceResourceSuccess = {
                    success: true,
                    message: "Resource retrieved successfully.",
                    username: input.username,
                    space_number: input.space_number,
                    space_resource_id: input.space_resource_id,
                    resource: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserCopilotSpaceResourceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
