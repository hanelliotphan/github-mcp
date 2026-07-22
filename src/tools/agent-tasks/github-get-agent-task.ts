import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetAgentTaskFailure,
    GetAgentTaskSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetAgentTaskTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_agent_task",
        "Get a Copilot cloud agent task by ID with its associated sessions (GET /agents/tasks/{task_id}). " +
            "**Public preview**—subject to change. Requires a fine-grained PAT or GitHub App user token with " +
            '"Agent tasks" repository permission (read); installation tokens are not supported. Returns HTTP **200**. ' +
            "See [Get a task by ID](https://docs.github.com/en/rest/agent-tasks/agent-tasks?apiVersion=2026-03-10#get-a-task-by-id).",
        {
            task_id: z.string().min(1).describe("The unique identifier of the task.")
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /agents/tasks/{task_id}", {
                    task_id: input.task_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAgentTaskSuccess = {
                    success: true,
                    message: "Agent task retrieved successfully.",
                    http_status: response.status,
                    task_id: input.task_id,
                    task: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAgentTaskFailure = {
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
