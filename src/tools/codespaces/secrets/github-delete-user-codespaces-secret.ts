import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteUserCodespacesSecretFailure,
    DeleteUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function registerGithubDeleteUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_delete_user_codespaces_secret", "Delete user codespaces secret. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number") }, async (input) => {
        try {
            const response = await octokit.request("DELETE /user/codespaces/secrets/{secret_name}", { secret_name: input.secret_name });
            return textAndData({ success: true, message: "User codespaces secret deleted successfully.", http_status: response.status, secret_name: input.secret_name, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies DeleteUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies DeleteUserCodespacesSecretFailure);
        }
    });
}