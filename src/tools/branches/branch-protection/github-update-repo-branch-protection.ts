import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoBranchProtectionSuccess, UpdateRepoBranchProtectionFailure } from "../../../types.js";
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

export function registerGithubUpdateRepoBranchProtectionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_branch_protection",
        "Update branch protection (PUT /repos/{owner}/{repo}/branches/{branch}/protection). See [Update branch protection](https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2026-03-10#update-branch-protection).",
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
            required_status_checks: z
                .union([
                    z.object({
                        strict: z.boolean(),
                        contexts: z.array(z.string()),
                        checks: z
                            .array(
                                z.object({
                                    context: z.string().min(1),
                                    app_id: z.number().int().optional()
                                })
                            )
                            .optional()
                    }),
                    z.null()
                ]),
            enforce_admins: z.union([z.boolean(), z.null()]),
            required_pull_request_reviews: z
                .union([
                    z.object({
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
                    }),
                    z.null()
                ]),
            restrictions: z
                .union([
                    z.object({
                        users: z.array(z.string()),
                        teams: z.array(z.string()),
                        apps: z.array(z.string()).optional()
                    }),
                    z.null()
                ]),
            required_linear_history: z.boolean().optional(),
            allow_force_pushes: z.union([z.boolean(), z.null()]).optional(),
            allow_deletions: z.boolean().optional(),
            block_creations: z.boolean().optional(),
            required_conversation_resolution: z.boolean().optional(),
            lock_branch: z.boolean().optional(),
            allow_fork_syncing: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateBranchProtection({
                    owner: input.owner,
                    repo: input.name,
                    branch: input.branch,
                    required_status_checks: input.required_status_checks,
                    enforce_admins: input.enforce_admins,
                    required_pull_request_reviews: input.required_pull_request_reviews,
                    restrictions: input.restrictions,
                    ...(input.required_linear_history !== undefined
                        ? { required_linear_history: input.required_linear_history }
                        : {}),
                    ...(input.allow_force_pushes !== undefined
                        ? { allow_force_pushes: input.allow_force_pushes }
                        : {}),
                    ...(input.allow_deletions !== undefined ? { allow_deletions: input.allow_deletions } : {}),
                    ...(input.block_creations !== undefined ? { block_creations: input.block_creations } : {}),
                    ...(input.required_conversation_resolution !== undefined
                        ? { required_conversation_resolution: input.required_conversation_resolution }
                        : {}),
                    ...(input.lock_branch !== undefined ? { lock_branch: input.lock_branch } : {}),
                    ...(input.allow_fork_syncing !== undefined
                        ? { allow_fork_syncing: input.allow_fork_syncing }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoBranchProtectionSuccess = {
                    success: true,
                    message: "Branch protection updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    branch: input.branch,
                    protection: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoBranchProtectionFailure = {
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
