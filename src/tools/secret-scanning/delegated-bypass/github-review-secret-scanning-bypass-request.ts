import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ReviewSecretScanningBypassRequestSuccess, ReviewSecretScanningBypassRequestFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}


export function registerGithubReviewSecretScanningBypassRequestTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_review_secret_scanning_bypass_request",
        "Review a secret scanning bypass request (PATCH /repos/{owner}/{repo}/bypass-requests/secret-scanning/{bypass_request_number}). Classic tokens need security_events. See [Review a bypass request for secret scanning](https://docs.github.com/en/enterprise-cloud@latest/rest/secret-scanning/delegated-bypass?apiVersion=2026-03-10#review-a-bypass-request-for-secret-scanning).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            bypass_request_number: z.number().int().positive(),
            status: z.enum(["approve", "reject"]),
            message: z.string().min(1).max(2048)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /repos/{owner}/{repo}/bypass-requests/secret-scanning/{bypass_request_number}",
                    {
                        owner: input.owner,
                        repo: input.name,
                        bypass_request_number: input.bypass_request_number,
                        status: input.status,
                        message: input.message
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ReviewSecretScanningBypassRequestSuccess = {
                    success: true,
                    message: "Bypass request reviewed successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    bypass_request_number: input.bypass_request_number,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ReviewSecretScanningBypassRequestFailure = {
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
