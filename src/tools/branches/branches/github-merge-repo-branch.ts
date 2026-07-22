import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { MergeRepoBranchFailure, MergeRepoBranchSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubMergeRepoBranchTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_merge_repo_branch",
        "Merge a branch (POST /repos/{owner}/{repo}/merges). Returns **201** with the merge commit, or **204** when already merged. " +
            "See [Merge a branch](https://docs.github.com/en/rest/branches/branches?apiVersion=2026-03-10#merge-a-branch).",
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
            base: z.string().min(1).max(255),
            head: z.string().min(1).max(255),
            commit_message: z.string().min(1).max(65536).optional()
        },
        async (input) => {
            try {
                // Octokit types only model 201; GitHub also returns 204 when already merged.
                const response = await octokit.request("POST /repos/{owner}/{repo}/merges", {
                    owner: input.owner,
                    repo: input.name,
                    base: input.base,
                    head: input.head,
                    ...(input.commit_message !== undefined
                        ? { commit_message: input.commit_message }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const httpStatus = response.status as number;
                const alreadyMerged = httpStatus === 204;
                const raw = response.data as unknown;
                const successPayload: MergeRepoBranchSuccess = {
                    success: true,
                    message: alreadyMerged
                        ? "Branches are already merged."
                        : "Branch merge completed successfully.",
                    http_status: httpStatus,
                    owner: input.owner,
                    name: input.name,
                    base: input.base,
                    head: input.head,
                    merge: alreadyMerged || raw == null || raw === "" ? null : toPlain(raw),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: MergeRepoBranchFailure = {
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
