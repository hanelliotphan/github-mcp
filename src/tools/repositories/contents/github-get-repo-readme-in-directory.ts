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

function normalizeDir(dir: string): string {
    return dir.replace(/^\/+/, "").trim();
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

export function registerGithubGetRepoReadmeInDirectoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_readme_in_directory",
        "Get the README from a repository directory (GET /repos/{owner}/{repo}/readme/{dir}). " +
            "GitHub searches for a README under that path per the API docs. " +
            "Optional ref is a branch, tag, or commit SHA (defaults to the default branch). " +
            "Set decode_content to true to add decoded_content (UTF-8 from base64). " +
            "See GitHub REST docs for repository README in a directory and custom media types (raw, HTML).",
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
            dir: z
                .string()
                .max(4096)
                .transform((d) => normalizeDir(d))
                .refine((d) => d.length > 0, { message: "dir cannot be empty" }),
            ref: z.string().min(1).max(255).optional(),
            decode_content: z
                .union([z.boolean(), z.string(), z.number(), z.null()])
                .optional()
                .transform((v) => parseDecodeContentInput(v))
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getReadmeInDirectory({
                    owner: input.owner,
                    repo: input.name,
                    dir: input.dir,
                    ref: input.ref
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const raw = response.data as RepoContentBlob;
                const decode = input.decode_content;

                const data: RepoContentBlob = decode ? withDecodedFileContent(raw) : raw;

                const successPayload: GetRepoReadmeSuccess = {
                    success: true,
                    message: "Repository directory README retrieved successfully.",
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
