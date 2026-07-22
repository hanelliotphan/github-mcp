import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetAgentTaskForRepoFailure,
    GetAgentTaskForRepoSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetAgentTaskForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_agent_task_for_repo",
        "Get a Copilot cloud agent task by ID scoped to a repository (GET /agents/repos/{owner}/{repo}/tasks/{task_id}). " +
            "**Public preview**—subject to change. Requires a fine-grained PAT or GitHub App user token with " +
            '"Agent tasks" repository permission (read); installation tokens are not supported. ' +
            "Returns the task plus associated **`sessions`**. Returns HTTP **200**. " +
            "See [Get a task by repo](https://docs.github.com/en/rest/agent-tasks/agent-tasks?apiVersion=2026-03-10#get-a-task-by-repo).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            task_id: z.string().min(1).describe("The unique identifier of the task.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request("GET /agents/repos/{owner}/{repo}/tasks/{task_id}", {
                    owner: input.owner,
                    repo: input.name,
                    task_id: input.task_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAgentTaskForRepoSuccess = {
                    success: true,
                    message: "Agent task retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    task_id: input.task_id,
                    task: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAgentTaskForRepoFailure = {
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
