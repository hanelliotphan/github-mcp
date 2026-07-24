import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { GetMetaFailure, GetMetaSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetMetaTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_meta",
        "Get GitHub meta information including service IP ranges and domain names (GET /meta). " +
            "Always query live; documented values are examples. " +
            "See [Get GitHub meta information](https://docs.github.com/en/rest/meta/meta?apiVersion=2026-03-10#get-github-meta-information).",
        {},
        async () => {
            try {
                const response = await octokit.rest.meta.get();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetMetaSuccess = {
                    success: true,
                    message: "GitHub meta information retrieved successfully.",
                    http_status: response.status as number,
                    meta: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetMetaFailure = {
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
