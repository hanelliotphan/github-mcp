import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ReRunJobForWorkflowRunFailure,
    ReRunJobForWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubReRunJobForWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_re_run_job_for_workflow_run",
        "Re-run a job and its dependent jobs in a workflow run (POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun). " +
            "Optionally set **`enable_debug_logging`** to enable debug logging for the re-run. " +
            "Classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201**. " +
            "See [Re-run a job from a workflow run](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#re-run-a-job-from-a-workflow-run).",
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
            job_id: z.number().int().positive().describe("The unique identifier of the job."),
            enable_debug_logging: z.boolean().optional().describe("Whether to enable debug logging for the re-run (default false).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.reRunJobForWorkflowRun({
                    owner: input.owner,
                    repo: input.name,
                    job_id: input.job_id,
                    ...(input.enable_debug_logging !== undefined
                        ? { enable_debug_logging: input.enable_debug_logging }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ReRunJobForWorkflowRunSuccess = {
                    success: true,
                    message: "Job re-run requested successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    job_id: input.job_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReRunJobForWorkflowRunFailure = {
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
