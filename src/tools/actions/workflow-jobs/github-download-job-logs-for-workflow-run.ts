import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DownloadJobLogsForWorkflowRunFailure,
    DownloadJobLogsForWorkflowRunSuccess,
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
        message: `Expected HTTP 302 with a Location header for the job logs redirect; got status ${status}.`,
        hint: "The job or its logs may no longer be available. Otherwise GitHub may have changed the logs API.",
        retryable: false
    };
}

export function registerGithubDownloadJobLogsForWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_download_job_logs_for_workflow_run",
        "Get a temporary download URL for a workflow job's plain-text logs (GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs). " +
            "GitHub responds with HTTP 302 and a Location URL—this tool returns that URL without downloading the logs. " +
            "The URL expires after **1 minute**; follow it with GET (e.g. curl -L) to download. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. " +
            "See [Download job logs for a workflow run](https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2026-03-10#download-job-logs-for-a-workflow-run).",
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
            job_id: z.number().int().positive().describe("The unique identifier of the job.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
                    owner: input.owner,
                    repo: input.name,
                    job_id: input.job_id,
                    request: { redirect: "manual" }
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const headers = response.headers as Record<string, unknown>;
                const logsDownloadUrl = headerLocation(headers);

                if (response.status !== 302 || !logsDownloadUrl) {
                    const failurePayload: DownloadJobLogsForWorkflowRunFailure = {
                        success: false,
                        error: unexpectedRedirectError(response.status),
                        request_id: requestId
                    };
                    return textAndData(failurePayload);
                }

                const successPayload: DownloadJobLogsForWorkflowRunSuccess = {
                    success: true,
                    message: "Job logs redirect URL retrieved successfully. Follow the URL with GET (e.g. curl -L) to download; it expires after 1 minute.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    job_id: input.job_id,
                    logs_download_url: logsDownloadUrl,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DownloadJobLogsForWorkflowRunFailure = {
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
