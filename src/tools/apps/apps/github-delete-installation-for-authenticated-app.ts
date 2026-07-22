import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteInstallationForAuthenticatedAppFailure,
    DeleteInstallationForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteInstallationForAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_installation_for_authenticated_app",
        "Uninstall a GitHub App from a user, organization, or enterprise account (DELETE /app/installations/{installation_id}). " +
            "For a temporary block, prefer `github_suspend_app_installation`. " +
            "You must authenticate with a **JWT** (as a GitHub App). Returns **202** on success. " +
            "See [Delete an installation for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#delete-an-installation-for-the-authenticated-app).",
        {
            installation_id: z.number().int().min(1).describe("The unique identifier of the installation.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.deleteInstallation({
                    installation_id: input.installation_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteInstallationForAuthenticatedAppSuccess = {
                    success: true,
                    message: "Installation deleted successfully.",
                    http_status: response.status,
                    installation_id: input.installation_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteInstallationForAuthenticatedAppFailure = {
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
