import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    PublishUserCodespaceFailure,
    PublishUserCodespaceSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";



function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubPublishUserCodespaceTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_publish_user_codespace",
        "Publish a codespace to a repository (POST /user/codespaces/{codespace_name}/publish). Optional name and private. See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1),
            name: z.string().optional(),
            private: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /user/codespaces/{codespace_name}/publish", {
                    codespace_name: input.codespace_name,
                    ...(input.name !== undefined ? { name: input.name } : {}),
                    ...(input.private !== undefined ? { private: input.private } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: PublishUserCodespaceSuccess = {
                    success: true,
                    message: "Codespace published successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    codespace: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: PublishUserCodespaceFailure = {
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
