import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateRepoReleaseSuccess,
    UpdateRepoReleaseFailure
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

export function registerGithubUpdateRepoReleaseTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_release",
        "Update a release (PATCH /repos/{owner}/{repo}/releases/{release_id}). " +
            "MCP **`release_name`** maps to API **`name`**. " +
            "See [Update a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2026-03-10#update-a-release).",
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
            release_id: z.number().int().positive(),
            tag_name: z.string().min(1).optional(),
            target_commitish: z.string().min(1).optional(),
            release_name: z
                .string()
                .min(1)
                .optional()
                .describe("Release title (MCP `release_name` → API `name`)"),
            body: z.string().optional(),
            draft: z.boolean().optional(),
            prerelease: z.boolean().optional(),
            make_latest: z.enum(["true", "false", "legacy"]).optional(),
            discussion_category_name: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateRelease({
                    owner: input.owner,
                    repo: input.name,
                    release_id: input.release_id,
                    ...(input.tag_name !== undefined ? { tag_name: input.tag_name } : {}),
                    ...(input.target_commitish !== undefined
                        ? { target_commitish: input.target_commitish }
                        : {}),
                    ...(input.release_name !== undefined ? { name: input.release_name } : {}),
                    ...(input.body !== undefined ? { body: input.body } : {}),
                    ...(input.draft !== undefined ? { draft: input.draft } : {}),
                    ...(input.prerelease !== undefined ? { prerelease: input.prerelease } : {}),
                    ...(input.make_latest !== undefined ? { make_latest: input.make_latest } : {}),
                    ...(input.discussion_category_name !== undefined
                        ? { discussion_category_name: input.discussion_category_name }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoReleaseSuccess = {
                    success: true,
                    message: "Repository release updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    release_id: input.release_id,
                    release: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoReleaseFailure = {
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
