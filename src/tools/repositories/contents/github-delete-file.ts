import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteFileFailure, DeleteFileSuccess, FileCommitApiResult } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Delete endpoint uses name + email only (no `date` in GitHub schema). */
const deleteIdentityFields = {
    name: z.string().min(1).max(200),
    email: z.string().min(3).max(320)
};

function normalizePath(path: string): string {
    return path.replace(/^\/+/, "").trim();
}

function normalizeFileCommit(data: unknown): FileCommitApiResult {
    const d = data as { content?: unknown; commit?: unknown };
    const content =
        d.content !== null && d.content !== undefined && typeof d.content === "object"
            ? { ...(d.content as Record<string, unknown>) }
            : null;
    const commit =
        d.commit !== null && d.commit !== undefined && typeof d.commit === "object"
            ? { ...(d.commit as Record<string, unknown>) }
            : {};
    return { content, commit };
}

export function registerGithubDeleteFileTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_file",
        "Delete a file in a repository (DELETE /repos/{owner}/{repo}/contents/{path}). " +
            "Requires the file blob `sha` (e.g. from github_get_repo_content). " +
            "Classic tokens need `repo` scope; deleting under `.github/workflows` also requires `workflow` scope. " +
            "Do not run this and github_create_or_update_file_contents concurrently for the same path. See GitHub REST docs for repository contents.",
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
            path: z
                .string()
                .max(4096)
                .transform((p) => normalizePath(p))
                .refine((p) => p.length > 0, { message: "path cannot be empty" }),
            message: z.string().min(1).max(65536),
            sha: z.string().min(1).max(255),
            branch: z.string().min(1).max(255).optional(),
            committer: z.object(deleteIdentityFields).optional(),
            author: z.object(deleteIdentityFields).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.deleteFile({
                    owner: input.owner,
                    repo: input.name,
                    path: input.path,
                    message: input.message,
                    sha: input.sha,
                    branch: input.branch,
                    committer: input.committer,
                    author: input.author
                });

                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteFileSuccess = {
                    success: true,
                    message: "File deleted successfully.",
                    http_status: response.status,
                    result: normalizeFileCommit(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteFileFailure = {
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
