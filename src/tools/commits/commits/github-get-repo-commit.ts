import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoCommitFailure, GetRepoCommitSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubGetRepoCommitTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_commit",
        "Get a commit (GET /repos/{owner}/{repo}/commits/{ref}). Optional page/per_page paginate the files list when a commit diff exceeds 300 files. See [Get a commit](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10#get-a-commit).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            ref: z.string().min(1).max(255),
            page: z.number().int().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional()
        },
        async (input) => {
            const page = input.page ?? 1;
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                const response = await octokit.rest.repos.getCommit({
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref,
                    page,
                    per_page: perPage
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoCommitSuccess = {
                    success: true,
                    message: "Commit retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    ref: input.ref,
                    result: toPlain(response.data),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoCommitFailure = {
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
