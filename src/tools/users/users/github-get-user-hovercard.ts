import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetUserHovercardFailure, GetUserHovercardSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetUserHovercardTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_hovercard",
        "Get contextual hovercard information for a user (GET /users/{username}/hovercard). " +
            "Optional **`subject_type`** / **`subject_id`** add repository/issue/PR/org context. Classic tokens need **`repo`**. " +
            "See [Get contextual information for a user](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10#get-contextual-information-for-a-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                ),
            subject_type: z
                .enum(["organization", "repository", "issue", "pull_request"])
                .optional()
                .describe("Required when using subject_id."),
            subject_id: z
                .string()
                .min(1)
                .optional()
                .describe("ID for the subject_type. Required when using subject_type.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.getContextForUser({
                    username: input.username,
                    ...(input.subject_type !== undefined ? { subject_type: input.subject_type } : {}),
                    ...(input.subject_id !== undefined ? { subject_id: input.subject_id } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserHovercardSuccess = {
                    success: true,
                    message: "User hovercard retrieved successfully.",
                    http_status: response.status,
                    username: input.username,
                    hovercard: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserHovercardFailure = {
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
