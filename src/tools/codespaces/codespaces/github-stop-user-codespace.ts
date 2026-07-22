import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    StopUserCodespaceFailure,
    StopUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";



function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubStopUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_stop_user_codespace",
        "Stop a codespace (POST /user/codespaces/{codespace_name}/stop). See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /user/codespaces/{codespace_name}/stop", {
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: StopUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace stopped successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: StopUserCodespaceFailure = {
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
