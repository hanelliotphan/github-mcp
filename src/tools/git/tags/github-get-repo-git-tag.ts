import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoGitTagFailure, GetRepoGitTagSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoGitTagTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_git_tag",
        "Get a Git tag object (GET /repos/{owner}/{repo}/git/tags/{tag_sha}). " +
            "Returns the annotated tag object as **tag_object**. " +
            "See [Get a tag object](https://docs.github.com/en/rest/git/tags?apiVersion=2026-03-10#get-a-tag-object).",
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
            tag_sha: z.string().min(1).max(255)
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.getTag({
                    owner: input.owner,
                    repo: input.name,
                    tag_sha: input.tag_sha
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoGitTagSuccess = {
                    success: true,
                    message: "Git tag object retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    tag_object: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoGitTagFailure = {
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
