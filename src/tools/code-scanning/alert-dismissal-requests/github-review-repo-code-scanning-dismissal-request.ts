import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ReviewRepoCodeScanningDismissalRequestFailure,
    ReviewRepoCodeScanningDismissalRequestSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubReviewRepoCodeScanningDismissalRequestTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_review_repo_code_scanning_dismissal_request",
        "Review a dismissal request for a code scanning alert (PATCH /repos/{owner}/{repo}/dismissal-requests/code-scanning/{alert_number}). " +
            "Requires `status` (`approve`|`deny`) and `message`. Returns **204**. Classic tokens need `security_events`. " +
            "See [Review a dismissal request for a code scanning alert for a repository](https://docs.github.com/en/rest/code-scanning/alert-dismissal-requests?apiVersion=2026-03-10#review-a-dismissal-request-for-a-code-scanning-alert-for-a-repository).",
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
            alert_number: z.number().int().positive(),
            status: z.enum(["approve", "deny"]),
            message: z.string().min(1).max(2048)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /repos/{owner}/{repo}/dismissal-requests/code-scanning/{alert_number}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        alert_number: input.alert_number,
                        status: input.status,
                        message: input.message
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ReviewRepoCodeScanningDismissalRequestSuccess = {
                    success: true,
                    message: "Dismissal request reviewed successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReviewRepoCodeScanningDismissalRequestFailure = {
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
