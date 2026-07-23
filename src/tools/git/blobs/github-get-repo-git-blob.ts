import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoGitBlobFailure, GetRepoGitBlobSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoGitBlobTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_git_blob",
        "Get a Git blob object (GET /repos/{owner}/{repo}/git/blobs/{file_sha}). " +
            "The blob **content** is always base64-encoded in the response. Blobs up to 100 MB are supported. " +
            "See [Get a blob](https://docs.github.com/en/rest/git/blobs?apiVersion=2026-03-10#get-a-blob).",
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
            file_sha: z.string().min(1).max(255)
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.getBlob({
                    owner: input.owner,
                    repo: input.name,
                    file_sha: input.file_sha
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoGitBlobSuccess = {
                    success: true,
                    message: "Git blob retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    blob: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoGitBlobFailure = {
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
