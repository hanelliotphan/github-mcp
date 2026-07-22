import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    StartUserCodespaceFailure,
    StartUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";



function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubStartUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_start_user_codespace",
        "Start a codespace (POST /user/codespaces/{codespace_name}/start). See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /user/codespaces/{codespace_name}/start", {
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: StartUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace started successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: StartUserCodespaceFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
