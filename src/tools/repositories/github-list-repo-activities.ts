import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoActivitiesFailure,
    ListRepoActivitiesSuccess,
    RepoActivityItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function normalizeActivityItem(row: {
    id: number;
    node_id: string;
    before: string;
    after: string;
    ref: string;
    timestamp: string;
    activity_type: string;
    actor: { login?: string; id?: number; type?: string | null } | null;
}): RepoActivityItem {
    const actor = row.actor;
    return {
        id: row.id,
        node_id: row.node_id,
        before: row.before,
        after: row.after,
        ref: row.ref,
        timestamp: row.timestamp,
        activity_type: row.activity_type,
        actor: actor?.login
            ? {
                  login: actor.login,
                  id: actor.id,
                  type: actor.type ?? null
              }
            : null
    };
}

export function registerGithubListRepoActivitiesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_activities",
        "List activity history for a repository (GET /repos/{owner}/{repo}/activity). Same for user- or org-owned repos. Response includes `pagination` (next/prev/first/last cursors) parsed from the Link header when present; repeat calls with `after` / `before` from `pagination.next` etc.",
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
            direction: z.enum(["asc", "desc"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().optional(),
            after: z.string().optional(),
            ref: z.string().optional(),
            actor: z.string().optional(),
            time_period: z.enum(["day", "week", "month", "quarter", "year"]).optional(),
            activity_type: z
                .enum([
                    "push",
                    "force_push",
                    "branch_creation",
                    "branch_deletion",
                    "pr_merge",
                    "merge_queue_merge"
                ])
                .optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.listActivities({
                    owner: input.owner,
                    repo: input.name,
                    direction: input.direction,
                    per_page: input.per_page,
                    before: input.before,
                    after: input.after,
                    ref: input.ref,
                    actor: input.actor,
                    time_period: input.time_period,
                    activity_type: input.activity_type
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );

                const successPayload: ListRepoActivitiesSuccess = {
                    success: true,
                    message: "Repository activities retrieved successfully.",
                    pagination: parseGitHubLinkPagination(linkHeader),
                    activities: response.data.map((row) =>
                        normalizeActivityItem(
                            row as {
                                id: number;
                                node_id: string;
                                before: string;
                                after: string;
                                ref: string;
                                timestamp: string;
                                activity_type: string;
                                actor: { login?: string; id?: number; type?: string | null } | null;
                            }
                        )
                    ),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoActivitiesFailure = {
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
