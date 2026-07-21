import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DownloadWorkflowRunAttemptLogsFailure,
    DownloadWorkflowRunAttemptLogsSuccess,
    ErrorEnvelope
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function headerLocation(headers: Record<string, unknown>): string | undefined {
    const raw = headers.location ?? headers.Location;
    if (typeof raw === "string" && raw.length > 0) {
        return raw;
    }
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "string") {
        return raw[0];
    }
    return undefined;
}

function unexpectedRedirectError(status: number): ErrorEnvelope {
    return {
        status_code: status,
        error_type: "unknown_error",
        message: `Expected HTTP 302 with a Location header for the workflow run attempt logs redirect; got status ${status}.`,
        hint: "The run attempt or its logs may no longer be available. Otherwise GitHub may have changed the logs API.",
        retryable: false
    };
}

export function registerGithubDownloadWorkflowRunAttemptLogsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_download_workflow_run_attempt_logs",
        "Get a temporary download URL for a specific workflow run attempt's log archive " +
            "(GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs). " +
            "GitHub responds with HTTP 302 and a Location URL for a zip archive—this tool returns that URL without downloading. " +
            "The URL expires after **1 minute**; follow it with GET (e.g. curl -L) to download the archive. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. " +
            "See [Download workflow run attempt logs](https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#download-workflow-run-attempt-logs).",
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
            attempt_number: z.number().int().positive().describe("The attempt number of the workflow run.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.downloadWorkflowRunAttemptLogs({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id,
                    attempt_number: input.attempt_number,
                    request: { redirect: "manual" }
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const headers = response.headers as Record<string, unknown>;
                const logsDownloadUrl = headerLocation(headers);

                if (response.status !== 302 || !logsDownloadUrl) {
                    const failurePayload: DownloadWorkflowRunAttemptLogsFailure = {
                        success: false,
                        error: unexpectedRedirectError(response.status),
                        request_id: requestId
                    };
                    return textAndData(failurePayload);
                }

                const successPayload: DownloadWorkflowRunAttemptLogsSuccess = {
                    success: true,
                    message: "Workflow run attempt logs redirect URL retrieved successfully. Follow the URL with GET (e.g. curl -L) to download; it expires after 1 minute.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    attempt_number: input.attempt_number,
                    logs_download_url: logsDownloadUrl,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DownloadWorkflowRunAttemptLogsFailure = {
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
