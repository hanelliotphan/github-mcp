import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteIssueReactionSuccess,
    DeleteIssueReactionFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubDeleteIssueReactionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_issue_reaction",
        "Delete a reaction from an issue (DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}). Success is HTTP **204**. " +
            "See [Delete an issue reaction](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10#delete-an-issue-reaction).",
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
            issue_number: z.number().int().positive(),
            reaction_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.reactions.deleteForIssue({
                    owner: input.owner,
                    repo: input.name,
                    issue_number: input.issue_number,
                    reaction_id: input.reaction_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteIssueReactionSuccess = {
                    success: true,
                    message: "Issue reaction deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    issue_number: input.issue_number,
                    reaction_id: input.reaction_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteIssueReactionFailure = {
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
