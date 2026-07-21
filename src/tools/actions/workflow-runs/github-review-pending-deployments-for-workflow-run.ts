import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ReviewPendingDeploymentsForWorkflowRunFailure,
    ReviewPendingDeploymentsForWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubReviewPendingDeploymentsForWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_review_pending_deployments_for_workflow_run",
        "Approve or reject pending deployments that are waiting on protection rules for a workflow run " +
            "(POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments). " +
            "Provide **`environment_ids`** (the environments to review), **`state`** (`approved` or `rejected`), and a **`comment`**. " +
            "The authenticated user must be a required reviewer for the environments. Classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **200**. " +
            "See [Review pending deployments for a workflow run](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#review-pending-deployments-for-a-workflow-run).",
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
            environment_ids: z
                .array(z.number().int().nonnegative())
                .min(1)
                .describe("The list of environment ids to approve or reject."),
            state: z.enum(["approved", "rejected"]).describe("Whether to approve or reject deployment to the specified environments."),
            comment: z
                .string()
                .max(65535)
                .describe("A comment to accompany the deployment review. Required (may be an empty string).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.reviewPendingDeploymentsForRun({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id,
                    environment_ids: input.environment_ids,
                    state: input.state,
                    comment: input.comment
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ReviewPendingDeploymentsForWorkflowRunSuccess = {
                    success: true,
                    message: `Pending deployments ${input.state} successfully.`,
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    deployments: toPlain(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReviewPendingDeploymentsForWorkflowRunFailure = {
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
