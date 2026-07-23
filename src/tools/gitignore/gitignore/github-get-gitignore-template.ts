import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetGitignoreTemplateFailure,
    GetGitignoreTemplateSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetGitignoreTemplateTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_gitignore_template",
        "Get the content of a .gitignore template (GET /gitignore/templates/{name}). " +
            "MCP **`name`** is the template name (e.g. `Node`, `Python`) from `github_list_gitignore_templates`. " +
            "Default response includes **`name`** and **`source`**. " +
            "See [Get a gitignore template](https://docs.github.com/en/rest/gitignore/gitignore?apiVersion=2026-03-10#get-a-gitignore-template).",
        {
            name: z.string().min(1).describe("Gitignore template name (e.g. Node, Python).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.gitignore.getTemplate({
                    name: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetGitignoreTemplateSuccess = {
                    success: true,
                    message: "Gitignore template retrieved successfully.",
                    http_status: response.status as number,
                    name: input.name,
                    template: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetGitignoreTemplateFailure = {
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
