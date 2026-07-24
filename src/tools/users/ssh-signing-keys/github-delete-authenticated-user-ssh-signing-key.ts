import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteAuthenticatedUserSshSigningKeyFailure, DeleteAuthenticatedUserSshSigningKeySuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteAuthenticatedUserSshSigningKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_authenticated_user_ssh_signing_key",
        "Delete an SSH signing key for the authenticated user. See [docs](https://docs.github.com/en/rest/users/ssh-signing-keys?apiVersion=2026-03-10#delete-an-ssh-signing-key-for-the-authenticated-user).",
        { ssh_signing_key_id: z.number().int().positive() },
        async (input) => {
            try {
                const response = await octokit.rest.users.deleteSshSigningKeyForAuthenticatedUser({ ssh_signing_key_id: input.ssh_signing_key_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteAuthenticatedUserSshSigningKeySuccess = {
                    success: true,
                    message: "Deleted successfully.",
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteAuthenticatedUserSshSigningKeyFailure = {
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
