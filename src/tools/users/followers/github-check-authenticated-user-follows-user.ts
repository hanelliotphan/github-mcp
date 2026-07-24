import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckAuthenticatedUserFollowsUserFailure, CheckAuthenticatedUserFollowsUserSuccess } from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCheckAuthenticatedUserFollowsUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_authenticated_user_follows_user",
        "Check if the authenticated user follows a user (GET /user/following/{username}). " +
            "GitHub returns **204** when true, **404** when false. " +
            "On **404**, this tool returns **`followed: false`**. " +
            "See [Check if the authenticated user follows a user (GET /user/following/{username}).](https://docs.github.com/en/rest/users/followers?apiVersion=2026-03-10#check-if-a-person-is-followed-by-the-authenticated-user).",
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
                const response = await octokit.rest.users.checkPersonIsFollowedByAuthenticated({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckAuthenticatedUserFollowsUserSuccess = {
                    success: true,
                    message: "Authenticated user follows this user.",
                    username: input.username,
                    followed: true,
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckAuthenticatedUserFollowsUserSuccess = {
                        success: true,
                        message: "GitHub returned 404: authenticated user does not follow this user.",
                        username: input.username,
                        followed: false,
                        http_status: 404,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckAuthenticatedUserFollowsUserFailure = {
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
