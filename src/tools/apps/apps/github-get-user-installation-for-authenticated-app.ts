import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppInstallationItem,
    GetUserInstallationForAuthenticatedAppFailure,
    GetUserInstallationForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): AppInstallationItem {
    return JSON.parse(JSON.stringify(data)) as AppInstallationItem;
}

export function registerGithubGetUserInstallationForAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_installation_for_authenticated_app",
        "Get the authenticated GitHub App's installation for a user (GET /users/{username}/installation). " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get a user installation for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#get-a-user-installation-for-the-authenticated-app).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.getUserInstallation({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserInstallationForAuthenticatedAppSuccess = {
                    success: true,
                    message: "User installation retrieved successfully.",
                    http_status: response.status,
                    username: input.username,
                    installation: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserInstallationForAuthenticatedAppFailure = {
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
