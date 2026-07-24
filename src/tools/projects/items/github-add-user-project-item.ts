import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddUserProjectItemSuccess,
    AddUserProjectItemFailure
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

export function registerGithubAddUserProjectItemTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_user_project_item",
        "Add an issue or pull request to a user-owned project (POST /users/{username}/projectsV2/{project_number}/items). " +
            "Provide either **`id`**, or **`owner`** + **`name`** (repo) + **`number`**. " +
            "See [Add item to user owned project](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#add-item-to-user-owned-project).",
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
            type: z.enum(["Issue", "PullRequest"]),
            id: z.number().int().positive().optional().describe("Numeric issue or pull request id"),
            owner: z.string().min(1).optional().describe("Repository owner (with name + number)"),
            name: z
                .string()
                .min(1)
                .optional()
                .describe("Repository name (MCP `name` → API `repo`; with owner + number)"),
            number: z
                .number()
                .int()
                .positive()
                .optional()
                .describe("Issue or pull request number (with owner + name)")
        },
        async (input) => {
            try {
                const hasId = input.id !== undefined;
                const hasRepoRef =
                    input.owner !== undefined && input.name !== undefined && input.number !== undefined;
                if (!hasId && !hasRepoRef) {
                    const failurePayload: AddUserProjectItemFailure = {
                        success: false,
                        error: {
                            status_code: 400,
                            error_type: "validation_error",
                            message:
                                "Provide either `id`, or all of `owner`, `name` (repo), and `number`.",
                            hint: "Use numeric content `id`, or repository `owner` + `name` + issue/PR `number`.",
                            retryable: false
                        },
                        request_id: null
                    };
                    return textAndData(failurePayload);
                }
                const body: Record<string, unknown> = { type: input.type };
                if (hasId) {
                    body.id = input.id;
                }
                if (hasRepoRef) {
                    body.owner = input.owner;
                    body.repo = input.name;
                    body.number = input.number;
                }
                const response = await octokit.rest.projects.addItemForUser({
                    username: input.username,
                    project_number: input.project_number,
                    ...body
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddUserProjectItemSuccess = {
                    success: true,
                    message: "User project item added successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    project_number: input.project_number,
                    item: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddUserProjectItemFailure = {
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
