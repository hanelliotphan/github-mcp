import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SetUserCopilotSpaceCollaboratorRoleSuccess, SetUserCopilotSpaceCollaboratorRoleFailure } from "../../../types.js";
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

export function registerGithubSetUserCopilotSpaceCollaboratorRoleTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_user_copilot_space_collaborator_role",
        "Set a collaborator role for a user Copilot Space (PUT /users/{username}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}). role may be reader, writer, admin, or no_access (204 when removed). See [Set a collaborator role for a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/collaborators?apiVersion=2026-03-10#set-a-collaborator-role-for-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            actor_type: z.enum(["User", "Team"]),
            actor_identifier: z.string().min(1),
            role: z.enum(["reader", "writer", "admin", "no_access"])
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /users/{username}/copilot-spaces/{space_number}/collaborators/{actor_type}/{actor_identifier}",
                    {
                        username: input.username,
                        space_number: input.space_number,
                        actor_type: input.actor_type,
                        actor_identifier: input.actor_identifier,
                        role: input.role
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetUserCopilotSpaceCollaboratorRoleSuccess = {
                    success: true,
                    message: response.status === 204 ? "Collaborator removed successfully (no_access)." : "Collaborator role updated successfully.",
                    http_status: response.status,
                    username: input.username,
                    space_number: input.space_number,
                    actor_type: input.actor_type,
                    actor_identifier: input.actor_identifier,
                    role: input.role,
                    collaborator: response.status === 204 ? null : toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetUserCopilotSpaceCollaboratorRoleFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
