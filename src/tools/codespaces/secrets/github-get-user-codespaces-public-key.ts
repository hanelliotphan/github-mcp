import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserCodespacesPublicKeyFailure,
    GetUserCodespacesPublicKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}
export function registerGithubGetUserCodespacesPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_user_codespaces_public_key", "Get user codespaces public key. See GitHub REST secrets.", {}, async () => {
        try {
            const response = await octokit.request("GET /user/codespaces/secrets/public-key");
            return textAndData({ success: true, message: "User codespaces public key retrieved successfully.", http_status: response.status, public_key: toPlain(response.data), request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies GetUserCodespacesPublicKeySuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies GetUserCodespacesPublicKeyFailure);
        }
    });
}