import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateUserProjectViewSuccess,
    CreateUserProjectViewFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const userIdRegex = /^.+$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => toPlain(row));
}

export function registerGithubCreateUserProjectViewTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_user_project_view",
        "Create a view on a user-owned project (POST /users/{user_id}/projectsV2/{project_number}/views). " +
            "Requires **`name`** and **`layout`** (`table` / `board` / `roadmap`). Optional **`filter`**, **`visible_fields`**. " +
            "See [Create a view for a user-owned project](https://docs.github.com/en/rest/projects/views?apiVersion=2026-03-10#create-a-view-for-a-user-owned-project).",
        {
            user_id: z.string().min(1).describe("User id used in the Projects views API path (`/users/{user_id}/...`)"),
            project_number: z.number().int().positive(),
            name: z.string().min(1),
            layout: z.enum(["table", "board", "roadmap"]),
            filter: z.string().optional(),
            visible_fields: z.array(z.number().int().positive()).optional()
        },
        async (input) => {
            try {
                const body: Record<string, unknown> = {
                    name: input.name,
                    layout: input.layout
                };
                if (input.filter !== undefined) {
                    body.filter = input.filter;
                }
                if (input.visible_fields !== undefined) {
                    body.visible_fields = input.visible_fields;
                }
                const response = await octokit.request(
                    "POST /users/{user_id}/projectsV2/{project_number}/views",
                    {
                        user_id: input.user_id,
                        project_number: input.project_number,
                        ...body
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateUserProjectViewSuccess = {
                    success: true,
                    message: "User project view created successfully.",
                    http_status: response.status as number,
                    user_id: input.user_id,
                    project_number: input.project_number,
                    view: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateUserProjectViewFailure = {
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
