import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoCodeScanningDismissalRequestFailure,
    GetRepoCodeScanningDismissalRequestSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetRepoCodeScanningDismissalRequestTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_repo_code_scanning_dismissal_request",
        "Get a dismissal request for a code scanning alert (GET /repos/{owner}/{repo}/dismissal-requests/code-scanning/{alert_number}). " +
            "Classic tokens need `security_events`. " +
            "See [Get a dismissal request for a code scanning alert for a repository](https://docs.github.com/en/rest/code-scanning/alert-dismissal-requests?apiVersion=2026-03-10#get-a-dismissal-request-for-a-code-scanning-alert-for-a-repository).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            alert_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/dismissal-requests/code-scanning/{alert_number}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        alert_number: input.alert_number
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoCodeScanningDismissalRequestSuccess = {
                    success: true,
                    message: "Dismissal request retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    dismissal_request: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoCodeScanningDismissalRequestFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
