import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetUserByIdFailure, GetUserByIdSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetUserByIdTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_by_id",
        "Get a user by durable account ID (GET /user/{account_id}). Prefer this over login when identity must remain stable. " +
            "See [Get a user using their ID](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10#get-a-user-using-their-id).",
        {
            account_id: z.number().int().positive().describe("Durable GitHub account ID.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.getById({ account_id: input.account_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserByIdSuccess = {
                    success: true,
                    message: "User retrieved successfully.",
                    http_status: response.status,
                    account_id: input.account_id,
                    user: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserByIdFailure = {
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
