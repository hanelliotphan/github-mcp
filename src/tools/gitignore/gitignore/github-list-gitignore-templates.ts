import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    ListGitignoreTemplatesFailure,
    ListGitignoreTemplatesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubListGitignoreTemplatesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_gitignore_templates",
        "List all .gitignore templates available when creating a repository (GET /gitignore/templates). " +
            "Returns template names you can pass as a gitignore option on create-repo APIs. " +
            "See [Get all gitignore templates](https://docs.github.com/en/rest/gitignore/gitignore?apiVersion=2026-03-10#get-all-gitignore-templates).",
        {},
        async () => {
            try {
                const response = await octokit.rest.gitignore.getAllTemplates();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const templates = Array.isArray(response.data)
                    ? response.data.filter((row): row is string => typeof row === "string")
                    : [];
                const successPayload: ListGitignoreTemplatesSuccess = {
                    success: true,
                    message: "Gitignore templates retrieved successfully.",
                    http_status: response.status as number,
                    templates,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListGitignoreTemplatesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
