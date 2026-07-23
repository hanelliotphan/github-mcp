import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoGitMatchingRefsFailure, ListRepoGitMatchingRefsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainArray(data: unknown): Record<string, unknown>[] {
    return JSON.parse(JSON.stringify(data ?? [])) as Record<string, unknown>[];
}

export function registerGithubListRepoGitMatchingRefsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_git_matching_refs",
        "List matching Git references (GET /repos/{owner}/{repo}/git/matching-refs/{ref}). " +
            "Required **ref** prefix such as `heads/main` or `tags/v1`. Returns all matching refs in a single response (no pagination). " +
            "See [List matching references](https://docs.github.com/en/rest/git/refs?apiVersion=2026-03-10#list-matching-references).",
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
            ref: z.string().min(1).max(255)
        },
        async (input) => {
            try {
                const response = await octokit.rest.git.listMatchingRefs({
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListRepoGitMatchingRefsSuccess = {
                    success: true,
                    message: "Matching Git references retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    ref: input.ref,
                    refs: toPlainArray(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoGitMatchingRefsFailure = {
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
