import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoAutolinksFailure,
    ListRepoAutolinksSuccess,
    RepoAutolinkItem
} from "../../../types.js";
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

export function registerGithubListRepoAutolinksTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_autolinks",
        "List all autolinks configured for a repository (GET /repos/{owner}/{repo}/autolinks). " +
            "Autolink metadata is only available to repository administrators. " +
            "Fine-grained tokens need appropriate admin/repo permissions per GitHub. " +
            "See GitHub REST docs for repository autolinks.",
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
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.listAutolinks({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const autolinks = response.data.map((row) => toAutolinkItem(row));

                const successPayload: ListRepoAutolinksSuccess = {
                    success: true,
                    message: "Repository autolinks retrieved successfully.",
                    autolinks,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoAutolinksFailure = {
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
