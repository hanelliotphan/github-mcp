import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoGitTreeFailure, CreateRepoGitTreeSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const treeEntrySchema = z.object({
    path: z.string().optional(),
    mode: z.enum(["100644", "100755", "040000", "160000", "120000"]).optional(),
    type: z.enum(["blob", "tree", "commit"]).optional(),
    sha: z.union([z.string(), z.null()]).optional(),
    content: z.string().optional()
});

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoGitTreeTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_git_tree",
        "Create a Git tree object (POST /repos/{owner}/{repo}/git/trees). " +
            "Success is HTTP **201**. Required **tree** array of entries with optional path, mode, type, sha, and content. " +
            "Optional **base_tree** SHA to build on an existing tree. Returns **tree** including sha and url. " +
            "See [Create a tree](https://docs.github.com/en/rest/git/trees?apiVersion=2026-03-10#create-a-tree).",
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
            tree: z.array(treeEntrySchema).min(1),
            base_tree: z.string().min(1).max(255).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.createTree({
                    owner: input.owner,
                    repo: input.name,
                    tree: input.tree,
                    ...(input.base_tree !== undefined ? { base_tree: input.base_tree } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoGitTreeSuccess = {
                    success: true,
                    message: "Git tree created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    tree: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoGitTreeFailure = {
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
