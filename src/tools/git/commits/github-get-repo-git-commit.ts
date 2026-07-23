import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoGitCommitFailure, GetRepoGitCommitSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoGitCommitTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_git_commit",
        "Get a Git commit object (GET /repos/{owner}/{repo}/git/commits/{commit_sha}). " +
            "This is the low-level Git database API, not REST Commits \"Get a commit\" (`github_get_repo_commit`). " +
            "See [Get a commit object](https://docs.github.com/en/rest/git/commits?apiVersion=2026-03-10#get-a-commit-object).",
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
            commit_sha: z.string().min(1).max(255)
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.getCommit({
                    owner: input.owner,
                    repo: input.name,
                    commit_sha: input.commit_sha
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoGitCommitSuccess = {
                    success: true,
                    message: "Git commit object retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    commit: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoGitCommitFailure = {
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
