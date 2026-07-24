import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { ListApiVersionsFailure, ListApiVersionsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubListApiVersionsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_api_versions",
        "List all supported GitHub API versions (GET /versions). " +
            "See [Get all API versions](https://docs.github.com/en/rest/meta/meta?apiVersion=2026-03-10#get-all-api-versions).",
        {},
        async () => {
            try {
                const response = await octokit.rest.meta.getAllVersions();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const versions = Array.isArray(response.data)
                    ? response.data.filter((row): row is string => typeof row === "string")
                    : [];
                const successPayload: ListApiVersionsSuccess = {
                    success: true,
                    message: "API versions retrieved successfully.",
                    http_status: response.status as number,
                    versions,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListApiVersionsFailure = {
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
