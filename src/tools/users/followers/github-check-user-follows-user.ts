import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckUserFollowsUserFailure, CheckUserFollowsUserSuccess } from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCheckUserFollowsUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_user_follows_user",
        "Check if a user follows another user (GET /users/{username}/following/{target_user}). " +
            "GitHub returns **204** when true, **404** when false. " +
            "On **404**, this tool returns **`follows: false`**. " +
            "See [Check if a user follows another user](https://docs.github.com/en/rest/users/followers?apiVersion=2026-03-10#check-if-a-user-follows-another-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            target_user: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "target_user must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.checkFollowingForUser({
                    username: input.username,
                    target_user: input.target_user
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckUserFollowsUserSuccess = {
                    success: true,
                    message: "User follows the target user.",
                    username: input.username,
                    target_user: input.target_user,
                    follows: true,
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckUserFollowsUserSuccess = {
                        success: true,
                        message: "GitHub returned 404: user does not follow the target user.",
                        username: input.username,
                        target_user: input.target_user,
                        follows: false,
                        http_status: 404,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckUserFollowsUserFailure = {
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
