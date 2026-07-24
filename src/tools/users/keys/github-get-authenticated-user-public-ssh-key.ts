import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetAuthenticatedUserPublicSshKeyFailure, GetAuthenticatedUserPublicSshKeySuccess, UserPublicSshKeyRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(row: unknown): UserPublicSshKeyRow {
    return JSON.parse(JSON.stringify(row)) as UserPublicSshKeyRow;
}

export function registerGithubGetAuthenticatedUserPublicSshKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_authenticated_user_public_ssh_key",
        "Get a public SSH key for the authenticated user (GET /user/keys/{key_id}). See [docs](https://docs.github.com/en/rest/users/keys?apiVersion=2026-03-10#get-a-public-ssh-key-for-the-authenticated-user).",
        { key_id: z.number().int().positive() },
        async (input) => {
            try {
                const response = await octokit.rest.users.getPublicSshKeyForAuthenticatedUser({ key_id: input.key_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAuthenticatedUserPublicSshKeySuccess = {
                    success: true,
                    message: "Retrieved successfully.",
                    http_status: response.status,
                    public_ssh_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedUserPublicSshKeyFailure = {
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
