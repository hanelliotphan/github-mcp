import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ApproveWorkflowRunFailure,
    ApproveWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubApproveWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_approve_workflow_run",
        "Approve a workflow run for a pull request from a public fork of a first-time contributor " +
            "(POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve). " +
            "Classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201**. " +
            "See [Approve a workflow run for a fork pull request](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#approve-a-workflow-run-for-a-fork-pull-request).",
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
            run_id: z.number().int().positive().describe("The unique identifier of the workflow run.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.approveWorkflowRun({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ApproveWorkflowRunSuccess = {
                    success: true,
                    message: "Workflow run approved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ApproveWorkflowRunFailure = {
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
