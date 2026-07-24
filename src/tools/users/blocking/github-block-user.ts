import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { BlockUserFailure, BlockUserSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubBlockUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_block_user",
        "Block a user on behalf of the authenticated user (PUT /user/blocks/{username}). " +
            "GitHub returns **204** on success, **422** when the block cannot be applied. " +
            "See [Block a user](https://docs.github.com/en/rest/users/blocking?apiVersion=2026-03-10#block-a-user).",
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
                const response = await octokit.rest.users.block({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: BlockUserSuccess = {
                    success: true,
                    message: "User blocked successfully.",
                    http_status: response.status,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: BlockUserFailure = {
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
