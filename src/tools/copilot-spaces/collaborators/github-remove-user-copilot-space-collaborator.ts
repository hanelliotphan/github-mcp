import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RemoveUserCopilotSpaceCollaboratorSuccess, RemoveUserCopilotSpaceCollaboratorFailure } from "../../../types.js";
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

export function registerGithubRemoveUserCopilotSpaceCollaboratorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_user_copilot_space_collaborator",
        "Remove a collaborator from a user Copilot Space (DELETE /users/{username}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}). Returns HTTP 204. See [Remove a collaborator from a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/collaborators?apiVersion=2026-03-10#remove-a-collaborator-from-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            actor_type: z.enum(["User", "Team"]),
            actor_identifier: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /users/{username}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}",
                    {
                        username: input.username,
                        space_number: input.space_number,
                        actor_type: input.actor_type,
                        actor_identifier: input.actor_identifier
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveUserCopilotSpaceCollaboratorSuccess = {
                    success: true,
                    message: "Collaborator removed successfully.",
                    http_status: response.status,
                    username: input.username,
                    space_number: input.space_number,
                    actor_type: input.actor_type,
                    actor_identifier: input.actor_identifier,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveUserCopilotSpaceCollaboratorFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
