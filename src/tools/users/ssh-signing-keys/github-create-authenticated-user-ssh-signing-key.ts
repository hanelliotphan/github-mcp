import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateAuthenticatedUserSshSigningKeyFailure, CreateAuthenticatedUserSshSigningKeySuccess, UserSshSigningKeyRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(row: unknown): UserSshSigningKeyRow {
    return JSON.parse(JSON.stringify(row)) as UserSshSigningKeyRow;
}

export function registerGithubCreateAuthenticatedUserSshSigningKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_authenticated_user_ssh_signing_key",
        "Create an SSH signing key for the authenticated user. See [docs](https://docs.github.com/en/rest/users/ssh-signing-keys?apiVersion=2026-03-10#create-a-ssh-signing-key-for-the-authenticated-user).",
        {
            key: z.string().min(1),
            title: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.createSshSigningKeyForAuthenticatedUser({ key: input.key, title: input.title });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateAuthenticatedUserSshSigningKeySuccess = {
                    success: true,
                    message: "Created successfully.",
                    http_status: response.status,
                    ssh_signing_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateAuthenticatedUserSshSigningKeyFailure = {
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
