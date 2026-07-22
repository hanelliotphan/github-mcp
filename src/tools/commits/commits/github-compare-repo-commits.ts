import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CompareRepoCommitsFailure, CompareRepoCommitsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCompareRepoCommitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_compare_repo_commits",
        "Compare two commits (GET /repos/{owner}/{repo}/compare/{basehead}). Accepts base and head refs/SHAs; passed as basehead BASE...HEAD. Optional page/per_page paginate commits in large comparisons. See [Compare two commits](https://docs.github.com/en/rest/commits/commits?apiVersion=2026-03-10#compare-two-commits).",
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
            base: z.string().min(1).max(255),
            head: z.string().min(1).max(255),
            page: z.number().int().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.compareCommitsWithBasehead({
                    owner: input.owner,
                    repo: input.name,
                    basehead: `${input.base}...${input.head}`,
                    ...(input.page !== undefined ? { page: input.page } : {}),
                    ...(input.per_page !== undefined ? { per_page: input.per_page } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CompareRepoCommitsSuccess = {
                    success: true,
                    message: "Commits compared successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    base: input.base,
                    head: input.head,
                    result: toPlain(response.data),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    ...(input.page !== undefined ? { page: input.page } : {}),
                    ...(input.per_page !== undefined ? { per_page: input.per_page } : {})
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CompareRepoCommitsFailure = {
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
