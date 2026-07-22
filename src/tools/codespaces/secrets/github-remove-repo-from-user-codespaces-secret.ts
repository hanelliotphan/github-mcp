import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveRepoFromUserCodespacesSecretFailure,
    RemoveRepoFromUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function registerGithubRemoveRepoFromUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_remove_repo_from_user_codespaces_secret", "Remove repository from user codespaces secret. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), repository_id: z.number().int().positive() }, async (input) => {
        try {
            const response = await octokit.request("DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}", { secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository removed from user codespaces secret successfully.", http_status: response.status, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies RemoveRepoFromUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies RemoveRepoFromUserCodespacesSecretFailure);
        }
    });
}