import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ConcurrencyGroupItem,
    ListConcurrencyGroupsForWorkflowRunFailure,
    ListConcurrencyGroupsForWorkflowRunSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "concurrency_groups" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.concurrency_groups) ? o.concurrency_groups : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): ConcurrencyGroupItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as ConcurrencyGroupItem);
}

export function registerGithubListConcurrencyGroupsForWorkflowRunTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_concurrency_groups_for_workflow_run",
        "List GitHub Actions concurrency groups associated with a workflow run or its jobs (GET /repos/{owner}/{repo}/actions/runs/{run_id}/concurrency_groups). " +
            "Groups are derived from the run's configuration, so a group is included even when it currently has no active items (its `group_members` will be empty). " +
            "Returns **`total_count`** and **`concurrency_groups`** rows (`group_name`, `group_url`, `group_members`, …). " +
            "Uses cursor pagination via **`after`** (forward) and **`before`** (backward) cursors from the `Link` header. " +
            "Anyone with **read** access can use this; classic tokens need **`repo`** scope for private repositories. " +
            "Use `per_page` (1–100, default **100** when omitted); set `all_pages` to follow `next` cursors up to `max_pages` (default **100**). " +
            "See [List concurrency groups for a workflow run](https://docs.github.com/en/rest/actions/concurrency-groups?apiVersion=2026-03-10#list-concurrency-groups-for-a-workflow-run).",
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
            run_id: z.number().int().positive().describe("The unique identifier of the workflow run."),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().optional().describe("Cursor from the Link header to fetch results before."),
            after: z.string().optional().describe("Cursor from the Link header to fetch results after."),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                let firstTotalCount: number | undefined;
                const fetchChunk = async (cursors: { after?: string; before?: string }) => {
                    const response = await octokit.request(
                        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/concurrency_groups",
                        {
                            owner: input.owner,
                            repo: input.name,
                            run_id: input.run_id,
                            per_page: perPage,
                            ...(cursors.after ? { after: cursors.after } : {}),
                            ...(cursors.before ? { before: cursors.before } : {})
                        }
                    );
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
                };

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk
                    });
                    const concurrency_groups = toPlain(result.rows);
                    const successPayload: ListConcurrencyGroupsForWorkflowRunSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Concurrency groups partially listed (${result.pagesFetched} pages, ${concurrency_groups.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Concurrency groups listed successfully (${result.pagesFetched} pages, ${concurrency_groups.length} rows).`
                              : "Concurrency groups listed successfully.",
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        run_id: input.run_id,
                        total_count: firstTotalCount ?? concurrency_groups.length,
                        concurrency_groups,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const { rows, linkHeader, requestId } = await fetchChunk({
                    after: input.after,
                    before: input.before
                });
                const successPayload: ListConcurrencyGroupsForWorkflowRunSuccess = {
                    success: true,
                    message: "Concurrency groups listed successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    run_id: input.run_id,
                    total_count: firstTotalCount ?? rows.length,
                    concurrency_groups: toPlain(rows),
                    pagination: parseGitHubLinkPagination(linkHeader),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListConcurrencyGroupsForWorkflowRunFailure = {
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
