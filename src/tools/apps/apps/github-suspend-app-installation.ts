import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { SuspendAppInstallationFailure, SuspendAppInstallationSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubSuspendAppInstallationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_suspend_app_installation",
        "Suspend a GitHub App installation (PUT /app/installations/{installation_id}/suspended). " +
            "Blocks the app from accessing the account's resources and webhook events until unsuspended. " +
            "You must authenticate with a **JWT** (as a GitHub App). Returns **204** on success. " +
            "See [Suspend an app installation](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#suspend-an-app-installation).",
        {
            installation_id: z.number().int().min(1).describe("The unique identifier of the installation.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.suspendInstallation({
                    installation_id: input.installation_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SuspendAppInstallationSuccess = {
                    success: true,
                    message: "App installation suspended successfully.",
                    http_status: response.status,
                    installation_id: input.installation_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SuspendAppInstallationFailure = {
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
