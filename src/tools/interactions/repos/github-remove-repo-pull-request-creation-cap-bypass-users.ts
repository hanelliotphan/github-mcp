import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveRepoPullRequestCreationCapBypassUsersFailure,
    RemoveRepoPullRequestCreationCapBypassUsersSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveRepoPullRequestCreationCapBypassUsersTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_remove_repo_pull_request_creation_cap_bypass_users",
        "Remove users from the pull request creation cap bypass list (DELETE /repos/{owner}/{repo}/interaction-limits/pulls/bypass-list). " +
            "MCP **`name`** maps to API **`repo`**. Requires maintainer permissions. Returns HTTP 204 on success. " +
            "See [Remove users from the pull request creation cap bypass list for a repository](https://docs.github.com/en/rest/interactions/repos?apiVersion=2026-03-10#remove-users-from-the-pull-request-creation-cap-bypass-list-for-a-repository).",
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
            users: z
                .array(
                    z
                        .string()
                        .min(1)
                        .max(39)
                        .regex(
                            usernameRegex,
                            "each user must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                        )
                )
                .min(1)
                .max(100)
                .describe("User logins to remove from the bypass list (1–100 per request).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request(
                    "DELETE /repos/{owner}/{repo}/interaction-limits/pulls/bypass-list",
                    {
                        owner: input.owner,
                        repo: input.name,
                        users: input.users
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveRepoPullRequestCreationCapBypassUsersSuccess = {
                    success: true,
                    message: "Users removed from the pull request creation cap bypass list successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    users: input.users,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveRepoPullRequestCreationCapBypassUsersFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
