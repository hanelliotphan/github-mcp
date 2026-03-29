import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrUpdateFileContentsFailure,
    CreateOrUpdateFileContentsSuccess,
    FileCommitApiResult
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const identityFields = {
    name: z.string().min(1).max(200),
    email: z.string().min(3).max(320),
    date: z.string().max(64).optional()
};

function normalizePath(path: string): string {
    return path.replace(/^\/+/, "").trim();
}

function toApiBase64Content(content: string, alreadyBase64: boolean): string {
    if (alreadyBase64) {
        return content.replace(/\s/g, "");
    }
    return Buffer.from(content, "utf8").toString("base64");
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

export function registerGithubCreateOrUpdateFileContentsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_or_update_file_contents",
        "Create a new file or update an existing file (PUT /repos/{owner}/{repo}/contents/{path}). " +
            "Body `content` must be Base64 in the GitHub API; pass plain UTF-8 text by default, or set content_is_base64 true if you already supply Base64. " +
            "Provide `sha` from the current file blob when replacing an existing file (e.g. from github_get_repo_content). " +
            "Classic tokens need `repo` scope; modifying `.github/workflows` also requires `workflow` scope. " +
            "Do not run this and delete-file concurrently for the same path. See GitHub REST docs for repository contents.",
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
            content: z.string().min(1),
            content_is_base64: z.boolean().optional(),
            sha: z.string().min(1).max(255).optional(),
            branch: z.string().min(1).max(255).optional(),
            committer: z.object(identityFields).optional(),
            author: z.object(identityFields).optional()
        },
        async (input) => {
            try {
                const content = toApiBase64Content(input.content, input.content_is_base64 === true);

                const response = await octokit.rest.repos.createOrUpdateFileContents({
                    owner: input.owner,
                    repo: input.name,
                    path: input.path,
                    message: input.message,
                    content,
                    sha: input.sha,
                    branch: input.branch,
                    committer: input.committer,
                    author: input.author
                });

                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const httpStatus = response.status;
                const successPayload: CreateOrUpdateFileContentsSuccess = {
                    success: true,
                    message:
                        httpStatus === 201
                            ? "File created successfully."
                            : "File updated successfully.",
                    http_status: httpStatus,
                    result: normalizeFileCommit(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrUpdateFileContentsFailure = {
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
