import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UnfollowUserFailure, UnfollowUserSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubUnfollowUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_unfollow_user",
        "Unfollow a user (DELETE /user/following/{username}). Requires **user:follow** scope on classic tokens. " +
            "See [Unfollow a user (DELETE /user/following/{username}). Requires **user:follow** scope on classic tokens.](https://docs.github.com/en/rest/users/followers?apiVersion=2026-03-10#unfollow-a-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.unfollow({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UnfollowUserSuccess = {
                    success: true,
                    message: "Operation completed successfully.",
                    http_status: response.status,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UnfollowUserFailure = {
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
