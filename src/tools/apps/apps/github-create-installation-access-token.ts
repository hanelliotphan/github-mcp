import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateInstallationAccessTokenFailure,
    CreateInstallationAccessTokenSuccess,
    InstallationAccessTokenItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): InstallationAccessTokenItem {
    return JSON.parse(JSON.stringify(data)) as InstallationAccessTokenItem;
}

export function registerGithubCreateInstallationAccessTokenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_installation_access_token",
        "Create an installation access token for a GitHub App installation (POST /app/installations/{installation_id}/access_tokens). " +
            "Tokens expire in one hour. By default the token can access all repositories the installation can access. " +
            "Optionally limit with **`repositories`** (names) or **`repository_ids`**, and/or narrow **`permissions`**. " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Create an installation access token for an app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#create-an-installation-access-token-for-an-app).",
        {
            installation_id: z.number().int().min(1).describe("The unique identifier of the installation."),
            repositories: z
                .array(z.string().min(1))
                .max(500)
                .optional()
                .describe("Repository names the token should access (up to 500)."),
            repository_ids: z
                .array(z.number().int().min(1))
                .max(500)
                .optional()
                .describe("Repository IDs the token should access (up to 500)."),
            permissions: z
                .record(z.string(), z.string())
                .optional()
                .describe("Subset of app permissions for the token (cannot exceed the app's grants).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.createInstallationAccessToken({
                    installation_id: input.installation_id,
                    ...(input.repositories !== undefined ? { repositories: input.repositories } : {}),
                    ...(input.repository_ids !== undefined ? { repository_ids: input.repository_ids } : {}),
                    ...(input.permissions !== undefined
                        ? { permissions: input.permissions as Record<string, string> }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateInstallationAccessTokenSuccess = {
                    success: true,
                    message: "Installation access token created successfully.",
                    http_status: response.status,
                    installation_id: input.installation_id,
                    token: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateInstallationAccessTokenFailure = {
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
