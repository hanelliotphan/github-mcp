import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoGitCommitFailure, CreateRepoGitCommitSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const gitIdentityRequired = {
    name: z.string().min(1),
    email: z.string().min(3),
    date: z.string().optional()
};

const gitIdentityOptional = {
    name: z.string().min(1).optional(),
    email: z.string().min(3).optional(),
    date: z.string().optional()
};

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoGitCommitTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_git_commit",
        "Create a Git commit object (POST /repos/{owner}/{repo}/git/commits). " +
            "This is the low-level Git database API, not the REST Commits \"Create a commit\" endpoint. " +
            "Success is HTTP **201**. Required **message** and **tree** SHA; optional **parents**, **author**, **committer**, and **signature**. " +
            "See [Create a commit](https://docs.github.com/en/rest/git/commits?apiVersion=2026-03-10#create-a-commit).",
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
            message: z.string().min(1),
            tree: z.string().min(1).max(255),
            parents: z.array(z.string().min(1)).optional(),
            author: z.object(gitIdentityRequired).optional(),
            committer: z.object(gitIdentityOptional).optional(),
            signature: z.string().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.createCommit({
                    owner: input.owner,
                    repo: input.name,
                    message: input.message,
                    tree: input.tree,
                    ...(input.parents !== undefined ? { parents: input.parents } : {}),
                    ...(input.author !== undefined ? { author: input.author } : {}),
                    ...(input.committer !== undefined ? { committer: input.committer } : {}),
                    ...(input.signature !== undefined ? { signature: input.signature } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoGitCommitSuccess = {
                    success: true,
                    message: "Git commit object created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    commit: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoGitCommitFailure = {
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
