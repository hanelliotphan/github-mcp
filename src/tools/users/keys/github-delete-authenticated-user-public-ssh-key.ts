import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteAuthenticatedUserPublicSshKeyFailure, DeleteAuthenticatedUserPublicSshKeySuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteAuthenticatedUserPublicSshKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_authenticated_user_public_ssh_key",
        "Delete a public SSH key for the authenticated user (DELETE /user/keys/{key_id}). See [docs](https://docs.github.com/en/rest/users/keys?apiVersion=2026-03-10#delete-a-public-ssh-key-for-the-authenticated-user).",
        { key_id: z.number().int().positive() },
        async (input) => {
            try {
                const response = await octokit.rest.users.deletePublicSshKeyForAuthenticatedUser({ key_id: input.key_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteAuthenticatedUserPublicSshKeySuccess = {
                    success: true,
                    message: "Deleted successfully.",
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteAuthenticatedUserPublicSshKeyFailure = {
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
