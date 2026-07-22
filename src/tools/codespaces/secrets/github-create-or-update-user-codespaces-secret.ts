import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrUpdateUserCodespacesSecretFailure,
    CreateOrUpdateUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function registerGithubCreateOrUpdateUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_or_update_user_codespaces_secret", "Create or update user codespaces secret with optional selected_repository_ids. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), value: z.string(), selected_repository_ids: z.array(z.number().int().positive()).optional() }, async (input) => {
        try {
            const keyResponse = await octokit.request("GET /user/codespaces/secrets/public-key");
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.request("PUT /user/codespaces/secrets/{secret_name}", { secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id, ...(input.selected_repository_ids !== undefined ? { selected_repository_ids: input.selected_repository_ids } : {}) });
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "User codespaces secret created successfully." : "User codespaces secret updated successfully.", http_status: response.status, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies CreateOrUpdateUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies CreateOrUpdateUserCodespacesSecretFailure);
        }
    });
}