import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListUserCodespaceMachinesFailure,
    ListUserCodespaceMachinesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";



function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListUserCodespaceMachinesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_codespace_machines",
        "List machine types for a user codespace (GET /user/codespaces/{codespace_name}/machines). See GitHub REST Codespaces.",
        {
            codespace_name: z.string().min(1),
            
        },
        async (input) => {
            
            try {
                const response = await octokit.request("GET /user/codespaces/{codespace_name}/machines", {
                    codespace_name: input.codespace_name,
                    
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data as Record<string, unknown>;
                const machines = Array.isArray(data.machines) ? toPlain(data.machines) : [];
                const successPayload: ListUserCodespaceMachinesSuccess = {
                    success: true,
                    message: "Codespace machines listed successfully.",
                    http_status: response.status,
                    codespace_name: input.codespace_name,
                    machines,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserCodespaceMachinesFailure = {
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
