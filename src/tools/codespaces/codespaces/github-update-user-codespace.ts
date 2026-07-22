import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateUserCodespaceFailure,
    UpdateUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_user_codespace",
        "Update a codespace for the authenticated user (PATCH /user/codespaces/{codespace_name}). Optional machine, display_name, recent_folders. See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1),
            machine: z.string().optional(),
            display_name: z.string().optional(),
            recent_folders: z.array(z.string()).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("PATCH /user/codespaces/{codespace_name}", {
                    codespace_name: input.codespace_name,
                    ...(input.machine !== undefined ? { machine: input.machine } : {}),
                    ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
                    ...(input.recent_folders !== undefined ? { recent_folders: input.recent_folders } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace updated successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateUserCodespaceFailure = {
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
