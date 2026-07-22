import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateCommitCommentFailure, CreateCommitCommentSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateCommitCommentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_commit_comment",
        "Create a commit comment (POST /repos/{owner}/{repo}/commits/{commit_sha}/comments). body is required; optional path, position, and line. See [Create a commit comment](https://docs.github.com/en/rest/commits/comments?apiVersion=2026-03-10#create-a-commit-comment).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            commit_sha: z.string().min(1).max(64),
            body: z.string().min(1),
            path: z.string().min(1).optional(),
            position: z.number().int().optional(),
            line: z.number().int().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    commit_sha: input.commit_sha,
                    body: input.body,
                    ...(input.path !== undefined ? { path: input.path } : {}),
                    ...(input.position !== undefined ? { position: input.position } : {}),
                    ...(input.line !== undefined ? { line: input.line } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateCommitCommentSuccess = {
                    success: true,
                    message: "Commit comment created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    commit_sha: input.commit_sha,
                    comment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateCommitCommentFailure = {
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
