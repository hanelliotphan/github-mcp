import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoAutolinkFailure, GetRepoAutolinkSuccess, RepoAutolinkItem } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toAutolinkItem(row: {
    id: number;
    key_prefix: string;
    url_template: string;
    is_alphanumeric: boolean;
    updated_at?: string | null;
}): RepoAutolinkItem {
    return {
        id: row.id,
        key_prefix: row.key_prefix,
        url_template: row.url_template,
        is_alphanumeric: row.is_alphanumeric,
        updated_at: row.updated_at ?? null
    };
}

export function registerGithubGetRepoAutolinkTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_autolink",
        "Get one autolink reference by id for a repository (GET /repos/{owner}/{repo}/autolinks/{autolink_id}). " +
            "Same response shape as create autolink (**`id`**, **`key_prefix`**, **`url_template`**, **`is_alphanumeric`**, **`updated_at`**). " +
            "Autolink metadata is only available to **repository administrators**; missing or inaccessible autolinks return **404**. " +
            "GitHub Apps need repository **administration** read or write. " +
            "See [Get an autolink reference of a repository](https://docs.github.com/en/rest/repos/autolinks?apiVersion=2026-03-10#get-an-autolink-reference-of-a-repository).",
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
            autolink_id: z.number().int().min(1).describe("Numeric id of the autolink (from list or create).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getAutolink({
                    owner: input.owner,
                    repo: input.name,
                    autolink_id: input.autolink_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoAutolinkSuccess = {
                    success: true,
                    message: "Repository autolink retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    autolink_id: input.autolink_id,
                    autolink: toAutolinkItem(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoAutolinkFailure = {
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
