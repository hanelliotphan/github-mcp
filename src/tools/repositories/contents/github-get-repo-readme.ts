import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoReadmeFailure, GetRepoReadmeSuccess, RepoContentBlob } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseDecodeContentInput(value: unknown): boolean {
    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;
    if (value === undefined || value === null) return false;
    if (typeof value === "string") {
        const s = value.trim().toLowerCase();
        return s === "true" || s === "1" || s === "yes";
    }
    return false;
}

function withDecodedFileContent(blob: RepoContentBlob): RepoContentBlob {
    if (blob.type !== "file") {
        return blob;
    }
    if (blob.encoding !== "base64" || typeof blob.content !== "string" || blob.content.length === 0) {
        return { ...blob, decoded_content: null };
    }
    const compact = blob.content.replace(/\s/g, "");
    const decoded = Buffer.from(compact, "base64").toString("utf8");
    return { ...blob, decoded_content: decoded };
}

export function registerGithubGetRepoReadmeTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_readme",
        "Get the preferred README file for a repository (GET /repos/{owner}/{repo}/readme). " +
            "Optional ref is a branch, tag, or commit SHA (defaults to the default branch). " +
            "The JSON response includes base64 `content` for small files; set decode_content to true to add decoded_content (UTF-8). " +
            "See GitHub REST docs for repository README and custom media types (raw, HTML).",
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
            ref: z.string().min(1).max(255).optional(),
            decode_content: z
                .union([z.boolean(), z.string(), z.number(), z.null()])
                .optional()
                .transform((v) => parseDecodeContentInput(v))
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getReadme({
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const raw = response.data as RepoContentBlob;
                const decode = input.decode_content;

                const data: RepoContentBlob = decode ? withDecodedFileContent(raw) : raw;

                const successPayload: GetRepoReadmeSuccess = {
                    success: true,
                    message: "Repository README retrieved successfully.",
                    decode_content: decode,
                    data,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoReadmeFailure = {
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
