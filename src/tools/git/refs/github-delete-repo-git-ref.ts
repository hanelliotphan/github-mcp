import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoGitRefFailure, DeleteRepoGitRefSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteRepoGitRefTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_git_ref",
        "Delete a Git reference (DELETE /repos/{owner}/{repo}/git/refs/{ref}). " +
            "Success is HTTP **204**. Required **ref** such as `heads/feature-branch`. " +
            "See [Delete a reference](https://docs.github.com/en/rest/git/refs?apiVersion=2026-03-10#delete-a-reference).",
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
            ref: z.string().min(1).max(255)
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.deleteRef({
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoGitRefSuccess = {
                    success: true,
                    message: "Git reference deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    ref: input.ref,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoGitRefFailure = {
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
