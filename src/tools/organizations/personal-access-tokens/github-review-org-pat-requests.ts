import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ReviewOrgPatRequestsFailure,
    ReviewOrgPatRequestsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainData(data: unknown): Record<string, unknown> | undefined {
    if (data === null || data === undefined || data === "") {
        return undefined;
    }
    if (typeof data === "object" && Object.keys(data as object).length === 0) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubReviewOrgPatRequestsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_review_org_pat_requests",
        "Approve or deny **multiple pending requests** to access org resources via **fine-grained personal access tokens** (POST /orgs/{org}/personal-access-token-requests). " +
            "**Only GitHub Apps can use this endpoint.** " +
            "Provide **`action`** (`approve` or `deny`), **`pat_request_ids`** (1–100 request ids from **`github_list_org_pat_requests`**), and an optional **`reason`** (max 1024 chars). " +
            "**202** Accepted when the review is queued; **403**, **404**, **422**, **500** on errors. " +
            "To review a **single** request, prefer the single-request endpoint (`POST /orgs/{org}/personal-access-token-requests/{pat_request_id}`). " +
            "See [Review requests to access organization resources with fine-grained personal access tokens](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#review-requests-to-access-organization-resources-with-fine-grained-personal-access-tokens).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            action: z
                .enum(["approve", "deny"])
                .describe("Action to apply to the requests."),
            pat_request_ids: z
                .array(z.number().int().positive())
                .min(1)
                .max(100)
                .optional()
                .describe("Unique identifiers of the PAT access requests (1–100 values)."),
            reason: z
                .string()
                .max(1024)
                .optional()
                .describe("Reason for approving or denying the requests (max 1024 characters).")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/personal-access-token-requests",
                    {
                        org: input.org,
                        action: input.action,
                        ...(input.pat_request_ids !== undefined
                            ? { pat_request_ids: input.pat_request_ids }
                            : {}),
                        ...(input.reason !== undefined ? { reason: input.reason } : {})
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = toPlainData(response.data);
                const successPayload: ReviewOrgPatRequestsSuccess = {
                    success: true,
                    message:
                        input.action === "approve"
                            ? "PAT access request approval accepted (202; processed asynchronously)."
                            : "PAT access request denial accepted (202; processed asynchronously).",
                    http_status: response.status,
                    org: input.org,
                    action: input.action,
                    ...(input.pat_request_ids !== undefined
                        ? { pat_request_ids: input.pat_request_ids }
                        : {}),
                    ...(input.reason !== undefined ? { reason: input.reason } : {}),
                    ...(data ? { data } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReviewOrgPatRequestsFailure = {
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
