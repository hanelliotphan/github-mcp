import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    EnableWorkflowFailure,
    EnableWorkflowSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubEnableWorkflowTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_enable_workflow",
        "Enable a workflow, setting its state to `active` (PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable). " +
            "**`workflow_id`** may be the numeric id or the workflow file name (e.g. `main.yaml`). " +
            "OAuth tokens and classic PATs need the **`repo`** scope. Returns HTTP **204**. " +
            "See [Enable a workflow](https://docs.github.com/en/rest/actions/workflows?apiVersion=2026-03-10#enable-a-workflow).",
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
                const response = await octokit.rest.actions.enableWorkflow({
                    owner: input.owner,
                    repo: input.name,
                    workflow_id: input.workflow_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: EnableWorkflowSuccess = {
                    success: true,
                    message: "Workflow enabled successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    workflow_id: input.workflow_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: EnableWorkflowFailure = {
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
