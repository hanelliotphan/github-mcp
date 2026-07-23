import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoMilestoneSuccess, DeleteRepoMilestoneFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;


export function registerGithubDeleteRepoMilestoneTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_milestone",
        "Delete a milestone (DELETE /repos/{owner}/{repo}/milestones/{milestone_number}). See [Delete a milestone](https://docs.github.com/en/rest/issues/milestones?apiVersion=2026-03-10#delete-a-milestone).",
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
            milestone_number: z.number().int().positive(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.issues.deleteMilestone({ owner: input.owner, repo: input.name, milestone_number: input.milestone_number });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoMilestoneSuccess = {
                    success: true,
                    message: "Milestone deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    milestone_number: input.milestone_number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoMilestoneFailure = {
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
