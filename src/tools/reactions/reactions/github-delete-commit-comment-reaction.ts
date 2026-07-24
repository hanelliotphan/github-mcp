import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteCommitCommentReactionSuccess,
    DeleteCommitCommentReactionFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubDeleteCommitCommentReactionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_commit_comment_reaction",
        "Delete a reaction from a commit comment (DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}). Success is HTTP **204**. " +
            "See [Delete a commit comment reaction](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10#delete-a-commit-comment-reaction).",
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
            comment_id: z.number().int().positive(),
            reaction_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.reactions.deleteForCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    comment_id: input.comment_id,
                    reaction_id: input.reaction_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteCommitCommentReactionSuccess = {
                    success: true,
                    message: "Commit comment reaction deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    comment_id: input.comment_id,
                    reaction_id: input.reaction_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteCommitCommentReactionFailure = {
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
