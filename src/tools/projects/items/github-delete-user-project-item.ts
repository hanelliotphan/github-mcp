import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteUserProjectItemSuccess,
    DeleteUserProjectItemFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteUserProjectItemTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_user_project_item",
        "Delete an item from a user-owned project (DELETE /users/{username}/projectsV2/{project_number}/items/{item_id}). Success is HTTP **204**. " +
            "See [Delete project item for user](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#delete-project-item-for-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    loginRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            project_number: z.number().int().positive(),
            item_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.projects.deleteItemForUser({
                    username: input.username,
                    project_number: input.project_number,
                    item_id: input.item_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteUserProjectItemSuccess = {
                    success: true,
                    message: "User project item deleted successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    project_number: input.project_number,
                    item_id: input.item_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteUserProjectItemFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
