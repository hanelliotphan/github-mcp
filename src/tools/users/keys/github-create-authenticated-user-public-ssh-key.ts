import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateAuthenticatedUserPublicSshKeyFailure, CreateAuthenticatedUserPublicSshKeySuccess, UserPublicSshKeyRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(row: unknown): UserPublicSshKeyRow {
    return JSON.parse(JSON.stringify(row)) as UserPublicSshKeyRow;
}

export function registerGithubCreateAuthenticatedUserPublicSshKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_authenticated_user_public_ssh_key",
        "Create a public SSH key for the authenticated user (POST /user/keys). See [docs](https://docs.github.com/en/rest/users/keys?apiVersion=2026-03-10#create-a-public-ssh-key-for-the-authenticated-user).",
        {
            key: z.string().min(1),
            title: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.createPublicSshKeyForAuthenticatedUser({ key: input.key, title: input.title });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateAuthenticatedUserPublicSshKeySuccess = {
                    success: true,
                    message: "Created successfully.",
                    http_status: response.status,
                    public_ssh_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateAuthenticatedUserPublicSshKeyFailure = {
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
