import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { GetApiRootFailure, GetApiRootSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetApiRootTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_api_root",
        "Get Hypermedia links to resources accessible in GitHub's REST API (GET /). " +
            "See [GitHub API Root](https://docs.github.com/en/rest/meta/meta?apiVersion=2026-03-10#github-api-root).",
        {},
        async () => {
            try {
                const response = await octokit.rest.meta.root();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetApiRootSuccess = {
                    success: true,
                    message: "API root retrieved successfully.",
                    http_status: response.status as number,
                    root: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetApiRootFailure = {
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
