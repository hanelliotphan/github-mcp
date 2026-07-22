import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateScopedAccessTokenFailure,
    CreateScopedAccessTokenSuccess,
    ScopedAccessTokenItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): ScopedAccessTokenItem {
    return JSON.parse(JSON.stringify(data)) as ScopedAccessTokenItem;
}

export function registerGithubCreateScopedAccessTokenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_scoped_access_token",
        "Create a repository-scoped and/or permission-scoped user access token from a non-scoped token " +
            "(POST /applications/{client_id}/token/scoped). " +
            "**`access_token`** is required. Provide **`target`** (login) or **`target_id`** (numeric id) for the user/org to scope to. " +
            "Optionally set **`repositories`** or **`repository_ids`** (not both) and **`permissions`**. " +
            "Invalid tokens return **404**. " +
            "See [Create a scoped access token](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#create-a-scoped-access-token).",
        {
            client_id: z.string().min(1).describe("The client ID of the GitHub App."),
            access_token: z.string().min(1).describe("The user access token used to authenticate to the GitHub API."),
            target: z
                .string()
                .min(1)
                .optional()
                .describe("Login of the user or organization to scope to. Required unless target_id is set."),
            target_id: z
                .number()
                .int()
                .min(1)
                .optional()
                .describe("Numeric id of the user or organization to scope to. Required unless target is set."),
            repositories: z
                .array(z.string().min(1))
                .optional()
                .describe("Repository names to scope the token to. Do not combine with repository_ids."),
            repository_ids: z
                .array(z.number().int().min(1))
                .optional()
                .describe("Repository IDs to scope the token to. Do not combine with repositories."),
            permissions: z
                .record(z.string(), z.string())
                .optional()
                .describe("Permissions to grant on the scoped token.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.scopeToken({
                    client_id: input.client_id,
                    access_token: input.access_token,
                    ...(input.target !== undefined ? { target: input.target } : {}),
                    ...(input.target_id !== undefined ? { target_id: input.target_id } : {}),
                    ...(input.repositories !== undefined ? { repositories: input.repositories } : {}),
                    ...(input.repository_ids !== undefined ? { repository_ids: input.repository_ids } : {}),
                    ...(input.permissions !== undefined
                        ? { permissions: input.permissions as Record<string, string> }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateScopedAccessTokenSuccess = {
                    success: true,
                    message: "Scoped access token created successfully.",
                    http_status: response.status,
                    client_id: input.client_id,
                    authorization: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateScopedAccessTokenFailure = {
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
