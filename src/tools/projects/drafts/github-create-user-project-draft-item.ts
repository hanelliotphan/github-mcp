import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateUserProjectDraftItemFailure,
    CreateUserProjectDraftItemSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateUserProjectDraftItemTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_create_user_project_draft_item",
        "Create a draft issue item on a user-owned project (POST /user/{user_id}/projectsV2/{project_number}/drafts). " +
            "**`user_id`** is the user's numeric ID (as a string). Requires **`title`**; optional **`body`**. " +
            "See [Create draft item for user owned project](https://docs.github.com/en/rest/projects/drafts?apiVersion=2026-03-10#create-draft-item-for-user-owned-project).",
        {
            user_id: z.string().min(1).describe("The unique identifier of the user."),
            project_number: z.number().int().positive(),
            title: z.string().min(1),
            body: z.string().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /user/{user_id}/projectsV2/{project_number}/drafts",
                    {
                        user_id: input.user_id,
                        project_number: input.project_number,
                        title: input.title,
                        ...(input.body !== undefined ? { body: input.body } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateUserProjectDraftItemSuccess = {
                    success: true,
                    message: "User project draft item created successfully.",
                    http_status: response.status as number,
                    user_id: input.user_id,
                    project_number: input.project_number,
                    item: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateUserProjectDraftItemFailure = {
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
