import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserCodespaceFailure,
    GetUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_codespace",
        "Get a codespace for the authenticated user (GET /user/codespaces/{codespace_name}). See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1).describe("The name of the codespace.")
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /user/codespaces/{codespace_name}", {
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace retrieved successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserCodespaceFailure = {
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
