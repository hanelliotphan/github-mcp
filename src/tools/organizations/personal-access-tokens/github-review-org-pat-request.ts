import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ReviewOrgPatRequestFailure,
    ReviewOrgPatRequestSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubReviewOrgPatRequestTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_review_org_pat_request",
        "Approve or deny **one pending request** to access org resources via a **fine-grained personal access token** (POST /orgs/{org}/personal-access-token-requests/{pat_request_id}). " +
            "**Only GitHub Apps can use this endpoint.** " +
            "Provide **`action`** (`approve` or `deny`) and an optional **`reason`** (max 1024 chars). " +
            "Success is HTTP **204** No Content. **403**, **404**, **422**, **500** on errors. " +
            "To review **multiple** requests, use **`github_review_org_pat_requests`**. " +
            "See [Review a request to access organization resources with a fine-grained personal access token](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#review-a-request-to-access-organization-resources-with-a-fine-grained-personal-access-token).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            pat_request_id: z
                .number()
                .int()
                .positive()
                .describe("Unique identifier of the PAT access request."),
            action: z
                .enum(["approve", "deny"])
                .describe("Action to apply to the request."),
            reason: z
                .string()
                .max(1024)
                .optional()
                .describe("Reason for approving or denying the request (max 1024 characters).")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/personal-access-token-requests/{pat_request_id}",
                    {
                        org: input.org,
                        pat_request_id: input.pat_request_id,
                        action: input.action,
                        ...(input.reason !== undefined ? { reason: input.reason } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ReviewOrgPatRequestSuccess = {
                    success: true,
                    message:
                        input.action === "approve"
                            ? "PAT access request approved successfully."
                            : "PAT access request denied successfully.",
                    http_status: response.status,
                    org: input.org,
                    pat_request_id: input.pat_request_id,
                    action: input.action,
                    ...(input.reason !== undefined ? { reason: input.reason } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReviewOrgPatRequestFailure = {
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
