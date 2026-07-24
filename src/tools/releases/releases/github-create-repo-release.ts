import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoReleaseSuccess,
    CreateRepoReleaseFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubCreateRepoReleaseTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_release",
        "Create a release (POST /repos/{owner}/{repo}/releases). Requires **`tag_name`**. " +
            "MCP **`release_name`** maps to API **`name`** (release title). Optional draft/prerelease/notes flags. " +
            "See [Create a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2026-03-10#create-a-release).",
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
            tag_name: z.string().min(1),
            target_commitish: z.string().min(1).optional(),
            release_name: z
                .string()
                .min(1)
                .optional()
                .describe("Release title (MCP `release_name` → API `name`)"),
            body: z.string().optional(),
            draft: z.boolean().optional(),
            prerelease: z.boolean().optional(),
            discussion_category_name: z.string().min(1).optional(),
            generate_release_notes: z.boolean().optional(),
            make_latest: z.enum(["true", "false", "legacy"]).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createRelease({
                    owner: input.owner,
                    repo: input.name,
                    tag_name: input.tag_name,
                    ...(input.target_commitish !== undefined
                        ? { target_commitish: input.target_commitish }
                        : {}),
                    ...(input.release_name !== undefined ? { name: input.release_name } : {}),
                    ...(input.body !== undefined ? { body: input.body } : {}),
                    ...(input.draft !== undefined ? { draft: input.draft } : {}),
                    ...(input.prerelease !== undefined ? { prerelease: input.prerelease } : {}),
                    ...(input.discussion_category_name !== undefined
                        ? { discussion_category_name: input.discussion_category_name }
                        : {}),
                    ...(input.generate_release_notes !== undefined
                        ? { generate_release_notes: input.generate_release_notes }
                        : {}),
                    ...(input.make_latest !== undefined ? { make_latest: input.make_latest } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoReleaseSuccess = {
                    success: true,
                    message: "Repository release created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    release: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoReleaseFailure = {
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
