import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteWorkflowRunFailure,
    DeleteWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubDeleteWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_workflow_run",
        "Delete a specific workflow run (DELETE /repos/{owner}/{repo}/actions/runs/{run_id}). " +
            "Anyone with write access to the repository can use this endpoint. If the repository is private, " +
            "OAuth apps and classic PATs need the **`repo`** scope. Returns HTTP **204**. " +
            "See [Delete a workflow run](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#delete-a-workflow-run).",
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
                const response = await octokit.rest.actions.deleteWorkflowRun({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteWorkflowRunSuccess = {
                    success: true,
                    message: "Workflow run deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteWorkflowRunFailure = {
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
