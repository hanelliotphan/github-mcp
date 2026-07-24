import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetAuthenticatedUserSshSigningKeyFailure, GetAuthenticatedUserSshSigningKeySuccess, UserSshSigningKeyRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(row: unknown): UserSshSigningKeyRow {
    return JSON.parse(JSON.stringify(row)) as UserSshSigningKeyRow;
}

export function registerGithubGetAuthenticatedUserSshSigningKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_authenticated_user_ssh_signing_key",
        "Get an SSH signing key for the authenticated user. See [docs](https://docs.github.com/en/rest/users/ssh-signing-keys?apiVersion=2026-03-10#get-an-ssh-signing-key-for-the-authenticated-user).",
        { ssh_signing_key_id: z.number().int().positive() },
        async (input) => {
            try {
                const response = await octokit.rest.users.getSshSigningKeyForAuthenticatedUser({ ssh_signing_key_id: input.ssh_signing_key_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAuthenticatedUserSshSigningKeySuccess = {
                    success: true,
                    message: "Retrieved successfully.",
                    http_status: response.status,
                    ssh_signing_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedUserSshSigningKeyFailure = {
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
