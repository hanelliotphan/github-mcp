import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UnblockUserFailure, UnblockUserSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubUnblockUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_unblock_user",
        "Unblock a user on behalf of the authenticated user (DELETE /user/blocks/{username}). " +
            "GitHub returns **204** on success. " +
            "See [Unblock a user](https://docs.github.com/en/rest/users/blocking?apiVersion=2026-03-10#unblock-a-user).",
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
                const response = await octokit.rest.users.unblock({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UnblockUserSuccess = {
                    success: true,
                    message: "User unblocked successfully.",
                    http_status: response.status,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UnblockUserFailure = {
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
