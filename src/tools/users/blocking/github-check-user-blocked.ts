import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckUserBlockedFailure, CheckUserBlockedSuccess } from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCheckUserBlockedTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_user_blocked",
        "Check whether the authenticated user **blocks** a user (GET /user/blocks/{username}). " +
            "GitHub returns **204** when the user is blocked, **404** when they are not (or for spam accounts). " +
            "On **404**, this tool returns **`blocked: false`**. " +
            "See [Check if a user is blocked by the authenticated user](https://docs.github.com/en/rest/users/blocking?apiVersion=2026-03-10#check-if-a-user-is-blocked-by-the-authenticated-user).",
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
                const response = await octokit.rest.users.checkBlocked({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckUserBlockedSuccess = {
                    success: true,
                    message: "User is blocked by the authenticated user.",
                    username: input.username,
                    blocked: true,
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckUserBlockedSuccess = {
                        success: true,
                        message:
                            "GitHub returned 404: user is not blocked, or the account may be spam-flagged.",
                        username: input.username,
                        blocked: false,
                        http_status: 404,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckUserBlockedFailure = {
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
