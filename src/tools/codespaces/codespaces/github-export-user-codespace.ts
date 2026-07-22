import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ExportUserCodespaceFailure,
    ExportUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubExportUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_export_user_codespace",
        "Export a codespace for the authenticated user (POST /user/codespaces/{codespace_name}/exports). Returns HTTP 202 with export object. See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /user/codespaces/{codespace_name}/exports", {
                    codespace_name: input.codespace_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ExportUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace export started successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    export: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ExportUserCodespaceFailure = {
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
