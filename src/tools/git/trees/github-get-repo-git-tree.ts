import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoGitTreeFailure, GetRepoGitTreeSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

/** MCP clients may send booleans as strings; normalize for recursive tree fetch. */
function parseRecursiveInput(value: unknown): boolean {
    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;
    if (value === undefined || value === null) return false;
    if (typeof value === "string") {
        const s = value.trim().toLowerCase();
        return s === "true" || s === "1" || s === "yes";
    }
    return false;
}

export function registerGithubGetRepoGitTreeTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_git_tree",
        "Get a Git tree object (GET /repos/{owner}/{repo}/git/trees/{tree_sha}). " +
            "Optional **recursive** fetches nested trees (passes `recursive=1` to the API when true). " +
            "Returns **tree** including the **truncated** flag when the tree is too large. " +
            "See [Get a tree](https://docs.github.com/en/rest/git/trees?apiVersion=2026-03-10#get-a-tree).",
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
            tree_sha: z.string().min(1).max(255),
            recursive: z
                .union([z.boolean(), z.string(), z.number(), z.null()])
                .optional()
                .transform((v) => parseRecursiveInput(v))
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.getTree({
                    owner: input.owner,
                    repo: input.name,
                    tree_sha: input.tree_sha,
                    ...(input.recursive ? { recursive: "1" } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoGitTreeSuccess = {
                    success: true,
                    message: "Git tree retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    tree: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoGitTreeFailure = {
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
