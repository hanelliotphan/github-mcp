import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateAuthenticatedUserGpgKeyFailure, CreateAuthenticatedUserGpgKeySuccess, UserGpgKeyRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(row: unknown): UserGpgKeyRow {
    return JSON.parse(JSON.stringify(row)) as UserGpgKeyRow;
}

export function registerGithubCreateAuthenticatedUserGpgKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_authenticated_user_gpg_key",
        "Create a GPG key for the authenticated user (POST /user/gpg_keys). See [docs](https://docs.github.com/en/rest/users/gpg-keys?apiVersion=2026-03-10#create-a-gpg-key-for-the-authenticated-user).",
        {
            armored_public_key: z.string().min(1),
            name: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.createGpgKeyForAuthenticatedUser({ armored_public_key: input.armored_public_key, name: input.name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateAuthenticatedUserGpgKeySuccess = {
                    success: true,
                    message: "Created successfully.",
                    http_status: response.status,
                    gpg_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateAuthenticatedUserGpgKeyFailure = {
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
