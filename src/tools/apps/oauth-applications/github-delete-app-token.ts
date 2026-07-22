import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteAppTokenFailure, DeleteAppTokenSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteAppTokenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_app_token",
        "Revoke a single OAuth access token (DELETE /applications/{client_id}/token). " +
            "Required: **`client_id`**, **`access_token`** (sensitive; not logged). " +
            "Typically requires **OAuth/GitHub App client credentials** (basic auth with client id/secret), " +
            "not a normal Bearer personal access token. Returns **204** on success. " +
            "See [Delete an app token](https://docs.github.com/en/rest/apps/oauth-applications?apiVersion=2026-03-10#delete-an-app-token).",
        {
            client_id: z.string().min(1).describe("The client ID of the GitHub app."),
            access_token: z
                .string()
                .min(1)
                .describe("The OAuth access token used to authenticate to the GitHub API. Sensitive; do not log.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.deleteToken({
                    client_id: input.client_id,
                    access_token: input.access_token
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteAppTokenSuccess = {
                    success: true,
                    message: "App token deleted successfully.",
                    http_status: response.status,
                    client_id: input.client_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteAppTokenFailure = {
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
