import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetUserCodespaceExportFailure,
    GetUserCodespaceExportSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetUserCodespaceExportTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_codespace_export",
        "Get details about a codespace export (GET /user/codespaces/{codespace_name}/exports/{export_id}). See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1).describe("The name of the codespace."),
            export_id: z.number().int().positive().describe("The export id.")
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /user/codespaces/{codespace_name}/exports/{export_id}", {
                    codespace_name: input.codespace_name,
                    export_id: String(input.export_id)
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserCodespaceExportSuccess = {
                    success: true,
                    message: "Codespace export retrieved successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    export_id: input.export_id,
                    export: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserCodespaceExportFailure = {
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
