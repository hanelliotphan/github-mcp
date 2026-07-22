import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteAppAuthorizationFailure,
    DeleteAppAuthorizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteAppAuthorizationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_app_authorization",
        "Delete an app authorization (grant) for a user (DELETE /applications/{client_id}/grant). " +
            "Revokes the grant and all OAuth tokens for that user on the app. " +
            "Required: **`client_id`**, **`access_token`** (sensitive; not logged). " +
            "Typically requires **OAuth/GitHub App client credentials** (basic auth with client id/secret), " +
            "not a normal Bearer personal access token. Returns **204** on success. " +
            "See [Delete an app authorization](https://docs.github.com/en/rest/apps/oauth-applications?apiVersion=2026-03-10#delete-an-app-authorization).",
        {
            client_id: z.string().min(1).describe("The client ID of the GitHub app."),
            access_token: z
                .string()
                .min(1)
                .describe("The OAuth access token used to authenticate to the GitHub API. Sensitive; do not log.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.deleteAuthorization({
                    client_id: input.client_id,
                    access_token: input.access_token
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteAppAuthorizationSuccess = {
                    success: true,
                    message: "App authorization deleted successfully.",
                    http_status: response.status,
                    client_id: input.client_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteAppAuthorizationFailure = {
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
