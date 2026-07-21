import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetWorkflowRunUsageFailure,
    GetWorkflowRunUsageSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetWorkflowRunUsageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_workflow_run_usage",
        "Get the number of billable minutes and total run time for a workflow run " +
            "(GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing). " +
            "Billable minutes only apply to workflows in private repositories using GitHub-hosted runners. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. Returns HTTP **200**. " +
            "See [Get workflow run usage](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#get-workflow-run-usage).",
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
                const response = await octokit.rest.actions.getWorkflowRunUsage({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetWorkflowRunUsageSuccess = {
                    success: true,
                    message: "Workflow run usage retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    usage: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetWorkflowRunUsageFailure = {
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
