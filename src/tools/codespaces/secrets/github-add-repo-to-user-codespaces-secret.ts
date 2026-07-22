import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddRepoToUserCodespacesSecretFailure,
    AddRepoToUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function registerGithubAddRepoToUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_add_repo_to_user_codespaces_secret", "Add repository to user codespaces secret. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), repository_id: z.number().int().positive() }, async (input) => {
        try {
            const response = await octokit.request("PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}", { secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository added to user codespaces secret successfully.", http_status: response.status, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies AddRepoToUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies AddRepoToUserCodespacesSecretFailure);
        }
    });
}