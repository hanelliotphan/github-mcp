import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateWorkflowDispatchFailure,
    CreateWorkflowDispatchSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function readNumber(data: Record<string, unknown> | undefined, key: string): number | undefined {
    const value = data?.[key];
    return typeof value === "number" ? value : undefined;
}

function readString(data: Record<string, unknown> | undefined, key: string): string | undefined {
    const value = data?.[key];
    return typeof value === "string" ? value : undefined;
}

export function registerGithubCreateWorkflowDispatchTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_workflow_dispatch",
        "Manually trigger a GitHub Actions workflow run via a `workflow_dispatch` event " +
            "(POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches). " +
            "**`workflow_id`** may be the numeric id or the workflow file name (e.g. `main.yaml`). " +
            "Provide **`ref`** (a branch or tag name) and optional **`inputs`** (up to 25 keys matching the workflow file's `workflow_dispatch` inputs). " +
            "The workflow must be configured to run on `workflow_dispatch`. OAuth tokens and classic PATs need the **`repo`** scope. " +
            "When available, returns the created run's `workflow_run_id`, `run_url`, and `html_url`. " +
            "See [Create a workflow dispatch event](https://docs.github.com/en/rest/actions/workflows?apiVersion=2026-03-10#create-a-workflow-dispatch-event).",
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
                .describe("The workflow id (number) or the workflow file name (e.g. `main.yaml`)."),
            ref: z.string().min(1).describe("The git reference for the workflow: a branch or tag name."),
            inputs: z
                .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
                .optional()
                .describe("Input keys and values configured in the workflow file (max 25 properties). Defaults from the workflow are used when omitted.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.createWorkflowDispatch({
                    owner: input.owner,
                    repo: input.name,
                    workflow_id: input.workflow_id,
                    ref: input.ref,
                    ...(input.inputs ? { inputs: input.inputs } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data =
                    response.data && typeof response.data === "object"
                        ? (response.data as Record<string, unknown>)
                        : undefined;
                const workflowRunId = readNumber(data, "workflow_run_id");
                const runUrl = readString(data, "run_url");
                const htmlUrl = readString(data, "html_url");
                const successPayload: CreateWorkflowDispatchSuccess = {
                    success: true,
                    message: "Workflow dispatch event created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    workflow_id: input.workflow_id,
                    ref: input.ref,
                    ...(workflowRunId !== undefined ? { workflow_run_id: workflowRunId } : {}),
                    ...(runUrl !== undefined ? { run_url: runUrl } : {}),
                    ...(htmlUrl !== undefined ? { html_url: htmlUrl } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateWorkflowDispatchFailure = {
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
