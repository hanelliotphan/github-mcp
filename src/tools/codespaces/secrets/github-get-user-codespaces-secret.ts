import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserCodespacesSecretFailure,
    GetUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}
export function registerGithubGetUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_user_codespaces_secret", "Get user codespaces secret metadata. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number") }, async (input) => {
        try {
            const response = await octokit.request("GET /user/codespaces/secrets/{secret_name}", { secret_name: input.secret_name });
            return textAndData({ success: true, message: "User codespaces secret metadata retrieved successfully.", http_status: response.status, secret_name: input.secret_name, secret: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies GetUserCodespacesSecretFailure);
        }
    });
}