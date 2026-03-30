import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoForkFailure, CreateRepoForkSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { normalizeRepo } from "../../../utils/repo-normalize.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCreateRepoForkTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_fork",
        "Create a fork of a repository for the authenticated user (POST /repos/{owner}/{repo}/forks). " +
            "GitHub returns HTTP 202; fork creation is asynchronous—wait briefly before using git operations. " +
            "Optional `organization` forks into that org (requires permission). " +
            "`fork_name` sets the new repository name; omit to reuse the source name. " +
            "`default_branch_only` forks only the default branch. " +
            "Classic tokens need `repo` scope (and org permissions when forking into an org). " +
            "See GitHub REST docs for repository forks.",
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
            organization: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "organization must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
                .optional(),
            fork_name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "fork_name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                )
                .optional(),
            default_branch_only: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createFork({
                    owner: input.owner,
                    repo: input.name,
                    organization: input.organization,
                    name: input.fork_name,
                    default_branch_only: input.default_branch_only
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateRepoForkSuccess = {
                    success: true,
                    message:
                        "Fork request accepted (HTTP 202). GitHub creates the fork asynchronously; wait briefly before cloning or pushing.",
                    http_status: response.status,
                    repo: normalizeRepo(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoForkFailure = {
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
