import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetWorkflowUsageFailure,
    GetWorkflowUsageSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetWorkflowUsageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_workflow_usage",
        "Get the number of billable minutes used by a specific workflow in the current billing cycle " +
            "(GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing). " +
            "**`workflow_id`** may be the numeric id or the workflow file name (e.g. `main.yaml`). " +
            "Billable minutes only apply to workflows in private repositories using GitHub-hosted runners; usage is per OS in milliseconds. " +
            "Note: GitHub has announced this endpoint is closing down. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. Returns HTTP **200**. " +
            "See [Get workflow usage](https://docs.github.com/en/rest/actions/workflows?apiVersion=2026-03-10#get-workflow-usage).",
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
            workflow_id: z
                .union([z.number().int().positive(), z.string().min(1)])
                .describe("The workflow id (number) or the workflow file name (e.g. `main.yaml`).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getWorkflowUsage({
                    owner: input.owner,
                    repo: input.name,
                    workflow_id: input.workflow_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetWorkflowUsageSuccess = {
                    success: true,
                    message: "Workflow usage retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    workflow_id: input.workflow_id,
                    usage: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetWorkflowUsageFailure = {
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
