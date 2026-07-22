import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateCommitCommentFailure, UpdateCommitCommentSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateCommitCommentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_commit_comment",
        "Update a commit comment (PATCH /repos/{owner}/{repo}/comments/{comment_id}). body is required. See [Update a commit comment](https://docs.github.com/en/rest/commits/comments?apiVersion=2026-03-10#update-a-commit-comment).",
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
            comment_id: z.number().int().positive(),
            body: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    comment_id: input.comment_id,
                    body: input.body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateCommitCommentSuccess = {
                    success: true,
                    message: "Commit comment updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    comment_id: input.comment_id,
                    comment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateCommitCommentFailure = {
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
