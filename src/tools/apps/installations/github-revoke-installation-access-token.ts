import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    RevokeInstallationAccessTokenFailure,
    RevokeInstallationAccessTokenSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubRevokeInstallationAccessTokenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_revoke_installation_access_token",
        "Revoke the installation access token used to authenticate this request (DELETE /installation/token). " +
            "Once revoked, the token is invalidated and cannot be used; create a new one with " +
            "`github_create_installation_access_token`. " +
            "You must authenticate with an **installation access token**. Returns **204** on success. " +
            "See [Revoke an installation access token](https://docs.github.com/en/rest/apps/installations?apiVersion=2026-03-10#revoke-an-installation-access-token).",
        {},
        async () => {
            try {
                const response = await octokit.rest.apps.revokeInstallationAccessToken();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RevokeInstallationAccessTokenSuccess = {
                    success: true,
                    message: "Installation access token revoked successfully.",
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RevokeInstallationAccessTokenFailure = {
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
