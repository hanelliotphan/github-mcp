import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ReviewCustomGatesForWorkflowRunFailure,
    ReviewCustomGatesForWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubReviewCustomGatesForWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_review_custom_gates_for_workflow_run",
        "Approve or reject a custom deployment protection rule (gate) for a workflow run's environment " +
            "(POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule). " +
            "Provide **`environment_name`**, **`state`** (`approved` or `rejected`), and a **`comment`**. " +
            "Requires the GitHub App that created the deployment protection rule to be authorized. Returns HTTP **204**. " +
            "See [Review custom deployment protection rules for a workflow run](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#review-custom-deployment-protection-rules-for-a-workflow-run).",
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
            environment_name: z.string().min(1).describe("The name of the environment to approve or reject."),
            state: z.enum(["approved", "rejected"]).describe("Whether to approve or reject deployment to the specified environment."),
            comment: z
                .string()
                .max(65535)
                .describe("A comment to accompany the deployment review.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.reviewCustomGatesForRun({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id,
                    environment_name: input.environment_name,
                    state: input.state,
                    comment: input.comment
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ReviewCustomGatesForWorkflowRunSuccess = {
                    success: true,
                    message: `Custom deployment protection rule ${input.state} successfully.`,
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    environment_name: input.environment_name,
                    state: input.state,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReviewCustomGatesForWorkflowRunFailure = {
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
