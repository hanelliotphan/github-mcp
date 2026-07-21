import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetJobForWorkflowRunFailure,
    GetJobForWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubGetJobForWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_job_for_workflow_run",
        "Get a specific job in a workflow run (GET /repos/{owner}/{repo}/actions/jobs/{job_id}). " +
            "Returns the job with its status, conclusion, steps, runner, and timestamps. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. " +
            "See [Get a job for a workflow run](https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2026-03-10#get-a-job-for-a-workflow-run).",
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
            job_id: z.number().int().positive().describe("The unique identifier of the job.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getJobForWorkflowRun({
                    owner: input.owner,
                    repo: input.name,
                    job_id: input.job_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetJobForWorkflowRunSuccess = {
                    success: true,
                    message: "Workflow job retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    job_id: input.job_id,
                    job: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetJobForWorkflowRunFailure = {
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
