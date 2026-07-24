import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateCommitCommentReactionSuccess,
    CreateCommitCommentReactionFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubCreateCommitCommentReactionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_commit_comment_reaction",
        "Create a reaction on a commit comment (POST /repos/{owner}/{repo}/comments/{comment_id}/reactions). " +
            "Requires **`content`**. HTTP **200** means the reaction already existed; **201** means it was created. " +
            "See [Create reaction for a commit comment](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10#create-reaction-for-a-commit-comment).",
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
            content: z.enum(["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"])
        },
        async (input) => {
            try {
                const response = await octokit.rest.reactions.createForCommitComment({
                    owner: input.owner,
                    repo: input.name,
                    comment_id: input.comment_id,
                    content: input.content
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateCommitCommentReactionSuccess = {
                    success: true,
                    message: "Commit comment reaction created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    comment_id: input.comment_id,
                    reaction: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateCommitCommentReactionFailure = {
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
