import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteCommitCommentFailure, DeleteCommitCommentSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteCommitCommentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_commit_comment",
        "Delete a commit comment (DELETE /repos/{owner}/{repo}/comments/{comment_id}). Returns HTTP 204 on success. See [Delete a commit comment](https://docs.github.com/en/rest/commits/comments?apiVersion=2026-03-10#delete-a-commit-comment).",
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
                const response = await octokit.rest.repos.deleteCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    comment_id: input.comment_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteCommitCommentSuccess = {
                    success: true,
                    message: "Commit comment deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    comment_id: input.comment_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteCommitCommentFailure = {
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
