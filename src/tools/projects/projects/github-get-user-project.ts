import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserProjectSuccess,
    GetUserProjectFailure
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

export function registerGithubGetUserProjectTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_project",
        "Get a user-owned project (GET /users/{username}/projectsV2/{project_number}). " +
            "See [User project](https://docs.github.com/en/rest/projects/projects?apiVersion=2026-03-10#get-project-for-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    loginRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            project_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.projects.getForUser({
                    username: input.username,
                    project_number: input.project_number
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserProjectSuccess = {
                    success: true,
                    message: "User project retrieved successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    project_number: input.project_number,
                    project: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserProjectFailure = {
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
