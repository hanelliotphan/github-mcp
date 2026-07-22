import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCommitCommentFailure, GetCommitCommentSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetCommitCommentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_commit_comment",
        "Get a commit comment (GET /repos/{owner}/{repo}/comments/{comment_id}). See [Get a commit comment](https://docs.github.com/en/rest/commits/comments?apiVersion=2026-03-10#get-a-commit-comment).",
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
            comment_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    comment_id: input.comment_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCommitCommentSuccess = {
                    success: true,
                    message: "Commit comment retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    comment_id: input.comment_id,
                    comment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCommitCommentFailure = {
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
