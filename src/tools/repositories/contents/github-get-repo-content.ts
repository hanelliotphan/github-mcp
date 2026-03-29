import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoContentFailure, GetRepoContentSuccess, RepoContentBlob } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** MCP clients may send booleans as strings; normalize so decoding still runs. */
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

export function registerGithubGetRepoContentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_content",
        "Get the contents of a file or directory in a repository (GET /repos/{owner}/{repo}/contents/{path}). " +
            "Omit path or use an empty string for the repository root. Optional ref is a branch, tag, or commit SHA (defaults to the default branch). " +
            "Directory listings are limited to 1,000 entries; for more, use the Git Trees API. " +
            "Files above 1 MB may omit base64 content in JSON responses—see GitHub REST docs for repository contents. " +
            "Set decode_content to true to add decoded_content (UTF-8 text from base64) on file responses; binary files may not round-trip cleanly as UTF-8.",
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
            path: z.string().max(4096).optional(),
            ref: z.string().min(1).max(255).optional(),
            decode_content: z
                .union([z.boolean(), z.string(), z.number(), z.null()])
                .optional()
                .transform((v) => parseDecodeContentInput(v))
        },
        async (input) => {
            try {
                const path = input.path ?? "";
                const response = await octokit.rest.repos.getContent({
                    owner: input.owner,
                    repo: input.name,
                    path,
                    ref: input.ref
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const raw = response.data;
                const decode = input.decode_content;

                let data: GetRepoContentSuccess["data"];
                if (Array.isArray(raw)) {
                    data = raw as GetRepoContentSuccess["data"];
                } else if (decode) {
                    data = withDecodedFileContent(raw as RepoContentBlob);
                } else {
                    data = raw as GetRepoContentSuccess["data"];
                }

                const successPayload: GetRepoContentSuccess = {
                    success: true,
                    message: "Repository content retrieved successfully.",
                    decode_content: decode,
                    data,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoContentFailure = {
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
