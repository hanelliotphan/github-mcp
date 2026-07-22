import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetReposForUserCodespacesSecretFailure,
    SetReposForUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function registerGithubSetReposForUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_repos_for_user_codespaces_secret", "Set repositories for user codespaces secret. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), selected_repository_ids: z.array(z.number().int().positive()) }, async (input) => {
        try {
            const response = await octokit.request("PUT /user/codespaces/secrets/{secret_name}/repositories", { secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids });
            return textAndData({ success: true, message: "Repositories set successfully.", http_status: response.status, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetReposForUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies SetReposForUserCodespacesSecretFailure);
        }
    });
}