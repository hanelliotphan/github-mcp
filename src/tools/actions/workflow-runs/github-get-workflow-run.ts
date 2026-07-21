import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetWorkflowRunFailure,
    GetWorkflowRunSuccess,
    WorkflowRunItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): WorkflowRunItem {
    return JSON.parse(JSON.stringify(data)) as WorkflowRunItem;
}

export function registerGithubGetWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_workflow_run",
        "Get a specific workflow run by its id (GET /repos/{owner}/{repo}/actions/runs/{run_id}). " +
            "Set **`exclude_pull_requests`** to `true` to omit pull requests from the response (faster). " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. Returns HTTP **200**. " +
            "See [Get a workflow run](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#get-a-workflow-run).",
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
            exclude_pull_requests: z
                .boolean()
                .optional()
                .describe("If true, the response omits pull requests associated with the run (default false).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getWorkflowRun({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id,
                    ...(input.exclude_pull_requests !== undefined
                        ? { exclude_pull_requests: input.exclude_pull_requests }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetWorkflowRunSuccess = {
                    success: true,
                    message: "Workflow run retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    workflow_run: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetWorkflowRunFailure = {
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
