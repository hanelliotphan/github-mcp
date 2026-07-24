import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { GetZenFailure, GetZenSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubGetZenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_zen",
        "Get a random sentence from the Zen of GitHub (GET /zen). " +
            "See [Get the Zen of GitHub](https://docs.github.com/en/rest/meta/meta?apiVersion=2026-03-10#get-the-zen-of-github).",
        {},
        async () => {
            try {
                const response = await octokit.rest.meta.getZen();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const zen =
                    typeof response.data === "string" ? response.data : String(response.data ?? "");
                const successPayload: GetZenSuccess = {
                    success: true,
                    message: "Zen of GitHub retrieved successfully.",
                    http_status: response.status as number,
                    zen,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetZenFailure = {
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
