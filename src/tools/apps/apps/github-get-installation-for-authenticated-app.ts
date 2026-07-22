import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppInstallationItem,
    GetInstallationForAuthenticatedAppFailure,
    GetInstallationForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): AppInstallationItem {
    return JSON.parse(JSON.stringify(data)) as AppInstallationItem;
}

export function registerGithubGetInstallationForAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_installation_for_authenticated_app",
        "Get an installation for the authenticated GitHub App by id (GET /app/installations/{installation_id}). " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get an installation for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#get-an-installation-for-the-authenticated-app).",
        {
            installation_id: z.number().int().min(1).describe("The unique identifier of the installation.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.getInstallation({
                    installation_id: input.installation_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetInstallationForAuthenticatedAppSuccess = {
                    success: true,
                    message: "Installation retrieved successfully.",
                    http_status: response.status,
                    installation_id: input.installation_id,
                    installation: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetInstallationForAuthenticatedAppFailure = {
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
