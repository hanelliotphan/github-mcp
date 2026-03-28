import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoTagsFailure, ListRepoTagsSuccess, RepoTagItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted; matches GitHub’s default for this endpoint. */
const DEFAULT_TAGS_PER_PAGE = 30 as const;

function normalizeTag(row: {
    name: string;
    commit: { sha: string; url: string };
    zipball_url: string;
    tarball_url: string;
    node_id: string;
}): RepoTagItem {
    return {
        name: row.name,
        commit_sha: row.commit.sha,
        commit_url: row.commit.url,
        zipball_url: row.zipball_url,
        tarball_url: row.tarball_url,
        node_id: row.node_id
    };
}

export function registerGithubListRepoTagsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_tags",
        "List tags for a repository (GET /repos/{owner}/{repo}/tags). Requires read access. " +
            "Use `per_page` (1–100, default 30 when omitted) and `page`. " +
            "When more pages exist, the response includes `pagination` from the `Link` header.",
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
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_TAGS_PER_PAGE;
                const response = await octokit.rest.repos.listTags({
                    owner: input.owner,
                    repo: input.name,
                    per_page: perPage,
                    page: input.page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoTagsSuccess = {
                    success: true,
                    message: "Repository tags retrieved successfully.",
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    tags: rows.map((row) =>
                        normalizeTag(
                            row as {
                                name: string;
                                commit: { sha: string; url: string };
                                zipball_url: string;
                                tarball_url: string;
                                node_id: string;
                            }
                        )
                    ),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoTagsFailure = {
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
