import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListAgentTasksForRepoFailure,
    ListAgentTasksForRepoSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../utils/github-paginate-all.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const DEFAULT_PER_PAGE = 30 as const;

const agentTaskStateSchema = z.enum([
    "queued",
    "in_progress",
    "completed",
    "failed",
    "idle",
    "waiting_for_user",
    "timed_out",
    "cancelled"
]);

function parseBody(data: unknown): {
    rows: unknown[];
    total_active_count?: number;
    total_archived_count?: number;
} {
    if (data && typeof data === "object" && "tasks" in data) {
        const o = data as Record<string, unknown>;
        return {
            rows: Array.isArray(o.tasks) ? o.tasks : [],
            ...(typeof o.total_active_count === "number" ? { total_active_count: o.total_active_count } : {}),
            ...(typeof o.total_archived_count === "number"
                ? { total_archived_count: o.total_archived_count }
                : {})
        };
    }
    return { rows: [] };
}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListAgentTasksForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_agent_tasks_for_repo",
        "List Copilot cloud agent tasks for a repository (GET /agents/repos/{owner}/{repo}/tasks). " +
            "**Public preview**—subject to change. Requires a fine-grained PAT or GitHub App user token with " +
            '"Agent tasks" repository permission (read); installation tokens are not supported. ' +
            "Optional filters: **`sort`** (`updated_at` default / `created_at`), **`direction`** (`desc` default / `asc`), " +
            "**`state`** (comma-separated task states), **`is_archived`**, **`since`** (ISO 8601), **`creator_id`** (one or more user IDs). " +
            "Use `per_page` (1–100, default **30**) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List tasks for repository](https://docs.github.com/en/rest/agent-tasks/agent-tasks?apiVersion=2026-03-10#list-tasks-for-repository).",
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
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            sort: z.enum(["updated_at", "created_at"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            state: z
                .string()
                .optional()
                .describe(
                    "Comma-separated task states: queued, in_progress, completed, failed, idle, waiting_for_user, timed_out, cancelled."
                ),
            is_archived: z.boolean().optional(),
            since: z.string().optional().describe("Only show tasks updated at or after this ISO 8601 timestamp."),
            creator_id: z.array(z.number().int().positive()).optional().describe("Filter by one or more creator user IDs."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            if (input.state) {
                const parts = input.state.split(",").map((s) => s.trim()).filter(Boolean);
                for (const part of parts) {
                    const parsed = agentTaskStateSchema.safeParse(part);
                    if (!parsed.success) {
                        const failurePayload: ListAgentTasksForRepoFailure = {
                            success: false,
                            error: {
                                status_code: 400,
                                error_type: "validation_error",
                                message: `Invalid task state "${part}". Allowed: queued, in_progress, completed, failed, idle, waiting_for_user, timed_out, cancelled.`,
                                retryable: false
                            },
                            request_id: null
                        };
                        return textAndData(failurePayload);
                    }
                }
            }
            const filters = {
                ...(input.sort ? { sort: input.sort } : {}),
                ...(input.direction ? { direction: input.direction } : {}),
                ...(input.state ? { state: input.state } : {}),
                ...(input.is_archived !== undefined ? { is_archived: input.is_archived } : {}),
                ...(input.since ? { since: input.since } : {}),
                ...(input.creator_id && input.creator_id.length > 0 ? { creator_id: input.creator_id } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstActive: number | undefined;
                    let firstArchived: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request("GET /agents/repos/{owner}/{repo}/tasks", {
                                owner: input.owner,
                                repo: input.name,
                                ...filters,
                                per_page: pp,
                                page
                            });
                            const parsed = parseBody(response.data);
                            if (firstActive === undefined && parsed.total_active_count !== undefined) {
                                firstActive = parsed.total_active_count;
                            }
                            if (firstArchived === undefined && parsed.total_archived_count !== undefined) {
                                firstArchived = parsed.total_archived_count;
                            }
                            return {
                                rows: parsed.rows as unknown[],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const tasks = toPlain(result.rows);
                    const successPayload: ListAgentTasksForRepoSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Agent tasks partially listed (${result.pagesFetched} pages, ${tasks.length} tasks); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Agent tasks listed successfully (${result.pagesFetched} pages, ${tasks.length} tasks).`
                              : "Agent tasks listed successfully.",
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        tasks,
                        ...(firstActive !== undefined ? { total_active_count: firstActive } : {}),
                        ...(firstArchived !== undefined ? { total_archived_count: firstArchived } : {}),
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        page: result.lastPage,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const page = input.page ?? 1;
                const response = await octokit.request("GET /agents/repos/{owner}/{repo}/tasks", {
                    owner: input.owner,
                    repo: input.name,
                    ...filters,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListAgentTasksForRepoSuccess = {
                    success: true,
                    message: "Agent tasks listed successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    tasks: toPlain(parsed.rows),
                    ...(parsed.total_active_count !== undefined
                        ? { total_active_count: parsed.total_active_count }
                        : {}),
                    ...(parsed.total_archived_count !== undefined
                        ? { total_archived_count: parsed.total_archived_count }
                        : {}),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAgentTasksForRepoFailure = {
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
