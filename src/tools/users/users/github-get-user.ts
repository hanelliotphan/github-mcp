import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetUserFailure, GetUserSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user",
        "Get public profile information for a user (GET /users/{username}). " +
            "See [Get a user](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10#get-a-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.getByUsername({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserSuccess = {
                    success: true,
                    message: "User retrieved successfully.",
                    http_status: response.status,
                    username: input.username,
                    user: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
