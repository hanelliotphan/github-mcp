import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteUserCodespaceFailure,
    DeleteUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";



export function registerGithubDeleteUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_user_codespace",
        "Delete a codespace for the authenticated user (DELETE /user/codespaces/{codespace_name}). Returns HTTP 202. See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /user/codespaces/{codespace_name}", {
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace deletion accepted.",
                    http_status: response.status,
                    
                    codespace_name: input.codespace_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteUserCodespaceFailure = {
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
