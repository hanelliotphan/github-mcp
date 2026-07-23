import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteUserCopilotSpaceSuccess, DeleteUserCopilotSpaceFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubDeleteUserCopilotSpaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_user_copilot_space",
        "Delete a Copilot Space for a user (DELETE /users/{username}/copilot-spaces/{space_number}). Returns HTTP 204. See [Delete a Copilot Space for a user](https://docs.github.com/en/rest/copilot-spaces/copilot-spaces?apiVersion=2026-03-10#delete-a-copilot-space-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            space_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /users/{username}/copilot-spaces/{space_number}", { username: input.username, space_number: input.space_number } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteUserCopilotSpaceSuccess = {
                    success: true,
                    message: "Copilot Space deleted successfully.",
                    http_status: response.status,
                    username: input.username,
                    space_number: input.space_number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteUserCopilotSpaceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
