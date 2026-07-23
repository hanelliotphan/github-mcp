import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AddUserCopilotSpaceCollaboratorSuccess, AddUserCopilotSpaceCollaboratorFailure } from "../../../types.js";
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

export function registerGithubAddUserCopilotSpaceCollaboratorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_user_copilot_space_collaborator",
        "Add a collaborator to a user Copilot Space (POST /users/{username}/copilot-spaces/{space_number}/collaborators). Requires actor_type (User|Team), actor_identifier, and role (reader|writer|admin). Returns HTTP 201. See [Add a collaborator to a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/collaborators?apiVersion=2026-03-10#add-a-collaborator-to-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive(),
            actor_type: z.enum(["User", "Team"]),
            actor_identifier: z.string().min(1),
            role: z.enum(["reader", "writer", "admin"])
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /users/{username}/copilot-spaces/{space_number}/collaborators",
                    {
                        username: input.username,
                        space_number: input.space_number,
                        actor_type: input.actor_type,
                        actor_identifier: input.actor_identifier,
                        role: input.role
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddUserCopilotSpaceCollaboratorSuccess = {
                    success: true,
                    message: "Collaborator added successfully.",
                    http_status: response.status,
                    username: input.username,
                    space_number: input.space_number,
                    actor_type: input.actor_type,
                    actor_identifier: input.actor_identifier,
                    role: input.role,
                    collaborator: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddUserCopilotSpaceCollaboratorFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
