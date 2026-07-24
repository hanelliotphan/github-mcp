import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetAuthenticatedUserGpgKeyFailure, GetAuthenticatedUserGpgKeySuccess, UserGpgKeyRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(row: unknown): UserGpgKeyRow {
    return JSON.parse(JSON.stringify(row)) as UserGpgKeyRow;
}

export function registerGithubGetAuthenticatedUserGpgKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_authenticated_user_gpg_key",
        "Get a GPG key for the authenticated user (GET /user/gpg_keys/{gpg_key_id}). See [docs](https://docs.github.com/en/rest/users/gpg-keys?apiVersion=2026-03-10#get-a-gpg-key-for-the-authenticated-user).",
        { gpg_key_id: z.number().int().positive() },
        async (input) => {
            try {
                const response = await octokit.rest.users.getGpgKeyForAuthenticatedUser({ gpg_key_id: input.gpg_key_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAuthenticatedUserGpgKeySuccess = {
                    success: true,
                    message: "Retrieved successfully.",
                    http_status: response.status,
                    gpg_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedUserGpgKeyFailure = {
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
