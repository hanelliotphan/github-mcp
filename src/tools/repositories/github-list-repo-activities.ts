import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoActivitiesFailure,
    ListRepoActivitiesSuccess,
    RepoActivityItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default `per_page` when omitted (**100**; aligned with other MCP list tools). */
const DEFAULT_ACTIVITY_PER_PAGE = 100 as const;

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
        "List activity history for a repository (GET /repos/{owner}/{repo}/activity). Same for user- or org-owned repos. " +
            "Uses cursor pagination (`after` / `before` from the `Link` header). Responses include `per_page`, `pages_fetched`, and `pagination`. " +
            "Set `all_pages` to follow `next` cursors up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next.after` / `before` or increase `max_pages`. " +
            "`per_page` defaults to **100** when omitted.",
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
                .optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_ACTIVITY_PER_PAGE;
                const mapActivities = (rows: unknown[]) =>
                    rows.map((row) =>
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
                    );

                const listActivities = async (cursors: { after?: string; before?: string }) => {
                    const response = await octokit.rest.repos.listActivities({
                        owner: input.owner,
                        repo: input.name,
                        direction: input.direction,
                        per_page: perPage,
                        before: cursors.before,
                        after: cursors.after,
                        ref: input.ref,
                        actor: input.actor,
                        time_period: input.time_period,
                        activity_type: input.activity_type
                    });
                    return {
                        rows: Array.isArray(response.data) ? response.data : [],
                        linkHeader: getLinkHeaderFromResponse(
                            response.headers as { link?: string; Link?: string }
                        ),
                        requestId: getRequestId(response.headers["x-github-request-id"])
                    };
                };

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk: listActivities
                    });
                    const activities = mapActivities(result.rows);
                    const successPayload: ListRepoActivitiesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Repository activities partially listed (${result.pagesFetched} pages, ${activities.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Repository activities retrieved successfully (${result.pagesFetched} pages, ${activities.length} items).`
                              : "Repository activities retrieved successfully.",
                        activities,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const { rows, linkHeader, requestId } = await listActivities({
                    after: input.after,
                    before: input.before
                });
                const successPayload: ListRepoActivitiesSuccess = {
                    success: true,
                    message: "Repository activities retrieved successfully.",
                    pagination: parseGitHubLinkPagination(linkHeader),
                    activities: mapActivities(rows),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
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
