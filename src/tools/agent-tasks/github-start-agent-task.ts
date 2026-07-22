import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    StartAgentTaskFailure,
    StartAgentTaskSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubStartAgentTaskTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_start_agent_task",
        "Start a new Copilot cloud agent task for a repository (POST /agents/repos/{owner}/{repo}/tasks). " +
            "**Public preview**—subject to change. Requires Copilot Business or Copilot Enterprise, and a fine-grained PAT or " +
            'GitHub App user token with "Agent tasks" repository permission (read and write); installation tokens are not supported. ' +
            "Required **`prompt`**. Optional **`model`**, **`custom_agent`** (filename without extension), **`create_pull_request`**, " +
            "**`base_ref`**, and **`head_ref`** (when both refs are set, the agent commits to `head_ref` using open PR context). Returns HTTP **201**. " +
            "See [Start a task](https://docs.github.com/en/rest/agent-tasks/agent-tasks?apiVersion=2026-03-10#start-a-task).",
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
            prompt: z.string().min(1).describe("The user's prompt for the agent."),
            model: z
                .string()
                .optional()
                .describe(
                    "Model for this task (depends on Copilot plan/org policy). Examples: claude-sonnet-4.6, claude-opus-4.6, gpt-5.2-codex, gpt-5.3-codex, gpt-5.4, claude-sonnet-4.5, claude-opus-4.5."
                ),
            custom_agent: z
                .string()
                .optional()
                .describe(
                    "Custom agent identifier (filename without extension), e.g. performance-optimizer for .github/agents/performance-optimizer.agent.md."
                ),
            create_pull_request: z.boolean().optional().describe("Whether to create a PR (default false)."),
            base_ref: z.string().optional().describe("Base ref for the new branch/PR."),
            head_ref: z
                .string()
                .optional()
                .describe(
                    "Head ref for an existing branch/PR. With base_ref, the agent uses open PR context and commits to head_ref."
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request("POST /agents/repos/{owner}/{repo}/tasks", {
                    owner: input.owner,
                    repo: input.name,
                    prompt: input.prompt,
                    ...(input.model ? { model: input.model } : {}),
                    ...(input.custom_agent ? { custom_agent: input.custom_agent } : {}),
                    ...(input.create_pull_request !== undefined
                        ? { create_pull_request: input.create_pull_request }
                        : {}),
                    ...(input.base_ref ? { base_ref: input.base_ref } : {}),
                    ...(input.head_ref ? { head_ref: input.head_ref } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: StartAgentTaskSuccess = {
                    success: true,
                    message: "Agent task started successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    task: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: StartAgentTaskFailure = {
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
