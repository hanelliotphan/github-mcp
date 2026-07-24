import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserProjectItemSuccess,
    GetUserProjectItemFailure
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

export function registerGithubGetUserProjectItemTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_project_item",
        "Get an item on a user-owned project (GET /users/{username}/projectsV2/{project_number}/items/{item_id}). " +
            "Optional **`fields`** limits returned field values by ID. " +
            "See [User project item](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#get-an-item-for-a-user-owned-project).",
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
                .array(z.number().int().positive())
                .optional()
                .describe("Field IDs to include; sent as comma-separated `fields` query")
        },
        async (input) => {
            try {
                const params: Record<string, unknown> = {
                    username: input.username,
                    project_number: input.project_number,
                    item_id: input.item_id
                };
                if (input.fields !== undefined && input.fields.length > 0) {
                    params.fields = input.fields.map(String).join(",");
                }
                const response = await octokit.rest.projects.getUserItem(params as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserProjectItemSuccess = {
                    success: true,
                    message: "User project item retrieved successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    project_number: input.project_number,
                    item_id: input.item_id,
                    item: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserProjectItemFailure = {
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
