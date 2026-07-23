import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserCopilotSpaceCollaboratorsSuccess, ListUserCopilotSpaceCollaboratorsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function getCollaborators(data: unknown): Record<string, unknown>[] {
    if (data && typeof data === "object" && "collaborators" in data) {
        const rows = (data as { collaborators?: unknown }).collaborators;
        return Array.isArray(rows) ? rows.map((row) => toPlain(row)) : [];
    }
    return [];
}

export function registerGithubListUserCopilotSpaceCollaboratorsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_copilot_space_collaborators",
        "List collaborators for a user Copilot Space (GET /users/{username}/copilot-spaces/{space_number}/collaborators). Returns collaborators array. Classic tokens need user scope. See [List collaborators for a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/collaborators?apiVersion=2026-03-10#list-collaborators-for-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /users/{username}/copilot-spaces/{space_number}/collaborators",
                    {
                        username: input.username,
                        space_number: input.space_number
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const collaborators = getCollaborators(response.data);
                const successPayload: ListUserCopilotSpaceCollaboratorsSuccess = {
                    success: true,
                    message: "Collaborators listed successfully.",
                    username: input.username,
                    space_number: input.space_number,
                    collaborators,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserCopilotSpaceCollaboratorsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
