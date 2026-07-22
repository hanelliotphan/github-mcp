import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { GetAuthenticatedAppFailure, GetAuthenticatedAppSuccess, GitHubAppItem } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainApp(data: unknown): GitHubAppItem {
    return JSON.parse(JSON.stringify(data)) as GitHubAppItem;
}

export function registerGithubGetAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_authenticated_app",
        "Get the GitHub App associated with the authentication credentials (GET /app). " +
            "Returns app metadata including **`installations_count`**. " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#get-the-authenticated-app).",
        {},
        async () => {
            try {
                const response = await octokit.rest.apps.getAuthenticated();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAuthenticatedAppSuccess = {
                    success: true,
                    message: "Authenticated app retrieved successfully.",
                    http_status: response.status,
                    app: toPlainApp(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedAppFailure = {
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
