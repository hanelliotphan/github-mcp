import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetWorkflowRunAttemptFailure,
    GetWorkflowRunAttemptSuccess,
    WorkflowRunItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): WorkflowRunItem {
    return JSON.parse(JSON.stringify(data)) as WorkflowRunItem;
}

export function registerGithubGetWorkflowRunAttemptTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_workflow_run_attempt",
        "Get a specific attempt of a workflow run (GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}). " +
            "Set **`exclude_pull_requests`** to `true` to omit pull requests from the response. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. Returns HTTP **200**. " +
            "See [Get a workflow run attempt](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#get-a-workflow-run-attempt).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            run_id: z.number().int().positive().describe("The unique identifier of the workflow run."),
            attempt_number: z.number().int().positive().describe("The attempt number of the workflow run."),
            exclude_pull_requests: z
                .boolean()
                .optional()
                .describe("If true, the response omits pull requests associated with the run (default false).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getWorkflowRunAttempt({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id,
                    attempt_number: input.attempt_number,
                    ...(input.exclude_pull_requests !== undefined
                        ? { exclude_pull_requests: input.exclude_pull_requests }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetWorkflowRunAttemptSuccess = {
                    success: true,
                    message: "Workflow run attempt retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    attempt_number: input.attempt_number,
                    workflow_run: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetWorkflowRunAttemptFailure = {
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
