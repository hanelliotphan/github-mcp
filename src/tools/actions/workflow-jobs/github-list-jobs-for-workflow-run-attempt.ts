import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListJobsForWorkflowRunAttemptFailure,
    ListJobsForWorkflowRunAttemptSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const DEFAULT_PER_PAGE = 30 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "jobs" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.jobs) ? o.jobs : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListJobsForWorkflowRunAttemptTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_jobs_for_workflow_run_attempt",
        "List jobs for a specific workflow run attempt (GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs). " +
            "Returns **`total_count`** and **`jobs`**. " +
            "Anyone with read access can use this; classic OAuth apps and PATs need the **`repo`** scope for private repositories. " +
            "Use `per_page` (1–100, default **30** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List jobs for a workflow run attempt](https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2026-03-10#list-jobs-for-a-workflow-run-attempt).",
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
            run_id: z.number().int().positive().describe("The unique identifier of the workflow run."),
            attempt_number: z.number().int().positive().describe("The attempt number of the workflow run."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
                                owner: input.owner,
                                repo: input.name,
                                run_id: input.run_id,
                                attempt_number: input.attempt_number,
                                per_page: pp,
                                page
                            });
                            const parsed = parseBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                            }
                            return {
                                rows: parsed.rows,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const jobs = toPlain(result.rows);
                    const successPayload: ListJobsForWorkflowRunAttemptSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Jobs partially listed (${result.pagesFetched} pages, ${jobs.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Jobs listed successfully (${result.pagesFetched} pages, ${jobs.length} rows).`
                              : "Jobs listed successfully.",
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        run_id: input.run_id,
                        attempt_number: input.attempt_number,
                        total_count: firstTotalCount ?? jobs.length,
                        jobs,
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
                const response = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
                    owner: input.owner,
                    repo: input.name,
                    run_id: input.run_id,
                    attempt_number: input.attempt_number,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListJobsForWorkflowRunAttemptSuccess = {
                    success: true,
                    message: "Jobs listed successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    attempt_number: input.attempt_number,
                    total_count: parsed.total_count,
                    jobs: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListJobsForWorkflowRunAttemptFailure = {
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
