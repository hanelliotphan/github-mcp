import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SyncForkBranchWithUpstreamFailure,
    SyncForkBranchWithUpstreamSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubSyncForkBranchWithUpstreamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_sync_fork_branch_with_upstream",
        "Sync a fork branch with upstream (POST /repos/{owner}/{repo}/merge-upstream). " +
            "See [Sync a fork branch with the upstream repository](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#sync-a-fork-branch-with-the-upstream-repository).",
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
            branch: z.string().min(1).max(255)
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.mergeUpstream({
                    owner: input.owner,
                    repo: input.name,
                    branch: input.branch
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SyncForkBranchWithUpstreamSuccess = {
                    success: true,
                    message: "Fork branch synced with upstream successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    branch: input.branch,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SyncForkBranchWithUpstreamFailure = {
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
