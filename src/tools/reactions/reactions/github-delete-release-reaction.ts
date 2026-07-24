import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteReleaseReactionSuccess,
    DeleteReleaseReactionFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubDeleteReleaseReactionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_release_reaction",
        "Delete a reaction from a release (DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}). Success is HTTP **204**. " +
            "See [Delete a release reaction](https://docs.github.com/en/rest/reactions/reactions?apiVersion=2026-03-10#delete-a-release-reaction).",
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
            release_id: z.number().int().positive(),
            reaction_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.reactions.deleteForRelease({
                    owner: input.owner,
                    repo: input.name,
                    release_id: input.release_id,
                    reaction_id: input.reaction_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteReleaseReactionSuccess = {
                    success: true,
                    message: "Release reaction deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    release_id: input.release_id,
                    reaction_id: input.reaction_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteReleaseReactionFailure = {
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
