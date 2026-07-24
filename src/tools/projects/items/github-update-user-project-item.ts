import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateUserProjectItemSuccess,
    UpdateUserProjectItemFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => toPlain(row));
}

export function registerGithubUpdateUserProjectItemTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_user_project_item",
        "Update field values on a user project item (PATCH /users/{username}/projectsV2/{project_number}/items/{item_id}). " +
            "Requires **`fields`**: `{ id, value }` where `value` is string, number, or null (clear). " +
            "See [Update project item for user](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#update-project-item-for-user).",
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
            item_id: z.number().int().positive(),
            fields: z
                .array(
                    z.object({
                        id: z.number().int().positive(),
                        value: z.union([z.string(), z.number(), z.null()])
                    })
                )
                .min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.projects.updateItemForUser({
                    username: input.username,
                    project_number: input.project_number,
                    item_id: input.item_id,
                    fields: input.fields
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateUserProjectItemSuccess = {
                    success: true,
                    message: "User project item updated successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    project_number: input.project_number,
                    item_id: input.item_id,
                    item: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateUserProjectItemFailure = {
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
