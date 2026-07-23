import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoGitTagFailure, CreateRepoGitTagSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoGitTagTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_git_tag",
        "Create a Git tag object (POST /repos/{owner}/{repo}/git/tags). " +
            "Success is HTTP **201**. Required **tag**, **message**, **object** SHA, and **type** (`commit`, `tree`, or `blob`). " +
            "Optional **tagger**. Does not create a `refs/tags/...` reference—use `github_create_repo_git_ref` for that. " +
            "See [Create a tag object](https://docs.github.com/en/rest/git/tags?apiVersion=2026-03-10#create-a-tag-object).",
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
            tag: z.string().min(1),
            message: z.string().min(1),
            object: z.string().min(1).max(255),
            type: z.enum(["commit", "tree", "blob"]),
            tagger: z
                .object({
                    name: z.string().min(1),
                    email: z.string().min(3),
                    date: z.string().optional()
                })
                .optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.createTag({
                    owner: input.owner,
                    repo: input.name,
                    tag: input.tag,
                    message: input.message,
                    object: input.object,
                    type: input.type,
                    ...(input.tagger !== undefined ? { tagger: input.tagger } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoGitTagSuccess = {
                    success: true,
                    message: "Git tag object created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    tag_object: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoGitTagFailure = {
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
