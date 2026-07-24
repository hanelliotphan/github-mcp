import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { GetAuthenticatedUserFailure, GetAuthenticatedUserSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_authenticated_user",
        "Get the authenticated user (GET /user). OAuth tokens need the **`user`** scope for private profile fields. " +
            "See [Get the authenticated user](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10#get-the-authenticated-user).",
        {},
        async () => {
            try {
                const response = await octokit.rest.users.getAuthenticated();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAuthenticatedUserSuccess = {
                    success: true,
                    message: "Authenticated user retrieved successfully.",
                    http_status: response.status,
                    user: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedUserFailure = {
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
