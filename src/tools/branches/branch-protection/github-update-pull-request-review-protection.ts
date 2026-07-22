import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdatePullRequestReviewProtectionSuccess, UpdatePullRequestReviewProtectionFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

function toPlainValue(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data));
}

export function registerGithubUpdatePullRequestReviewProtectionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_pull_request_review_protection",
        "Update pull request review protection (PATCH .../required_pull_request_reviews). See [Update pull request review protection](https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2026-03-10#update-pull-request-review-protection).",
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
            branch: z.string().min(1).max(255),
            dismissal_restrictions: z.object({
                users: z.array(z.string().min(1)).optional(),
                teams: z.array(z.string().min(1)).optional(),
                apps: z.array(z.string().min(1)).optional()
            }).optional(),
            dismiss_stale_reviews: z.boolean().optional(),
            require_code_owner_reviews: z.boolean().optional(),
            required_approving_review_count: z.number().int().min(0).max(6).optional(),
            require_last_push_approval: z.boolean().optional(),
            bypass_pull_request_allowances: z.object({
                users: z.array(z.string().min(1)).optional(),
                teams: z.array(z.string().min(1)).optional(),
                apps: z.array(z.string().min(1)).optional()
            }).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updatePullRequestReviewProtection({
                    owner: input.owner,
                    repo: input.name,
                    branch: input.branch,
                    ...(input.dismissal_restrictions !== undefined
                        ? { dismissal_restrictions: input.dismissal_restrictions }
                        : {}),
                    ...(input.dismiss_stale_reviews !== undefined
                        ? { dismiss_stale_reviews: input.dismiss_stale_reviews }
                        : {}),
                    ...(input.require_code_owner_reviews !== undefined
                        ? { require_code_owner_reviews: input.require_code_owner_reviews }
                        : {}),
                    ...(input.required_approving_review_count !== undefined
                        ? { required_approving_review_count: input.required_approving_review_count }
                        : {}),
                    ...(input.require_last_push_approval !== undefined
                        ? { require_last_push_approval: input.require_last_push_approval }
                        : {}),
                    ...(input.bypass_pull_request_allowances !== undefined
                        ? { bypass_pull_request_allowances: input.bypass_pull_request_allowances }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdatePullRequestReviewProtectionSuccess = {
                    success: true,
                    message: "Pull request review protection updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    branch: input.branch,
                    required_pull_request_reviews: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdatePullRequestReviewProtectionFailure = {
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
