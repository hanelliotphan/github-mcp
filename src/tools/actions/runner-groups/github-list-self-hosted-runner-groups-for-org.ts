import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListSelfHostedRunnerGroupsForOrgFailure,
    ListSelfHostedRunnerGroupsForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "runner_groups" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.runner_groups) ? o.runner_groups : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListSelfHostedRunnerGroupsForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_self_hosted_runner_groups_for_org",
        "List self-hosted runner groups configured in an organization, including groups inherited from an enterprise (GET /orgs/{org}/actions/runner-groups). " +
            "Returns **`total_count`** and **`runner_groups`**. Optionally filter with **`visible_to_repository`**. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List self-hosted runner groups for an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#list-self-hosted-runner-groups-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            visible_to_repository: z
                .string()
                .optional()
                .describe("Only return runner groups that are allowed to be used by this repository."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const visibleToRepository = input.visible_to_repository
                ? { visible_to_repository: input.visible_to_repository }
                : {};
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request("GET /orgs/{org}/actions/runner-groups", {
                                org: input.org,
                                ...visibleToRepository,
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
                    const runner_groups = toPlain(result.rows);
                    const successPayload: ListSelfHostedRunnerGroupsForOrgSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Runner groups partially listed (${result.pagesFetched} pages, ${runner_groups.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Runner groups listed successfully (${result.pagesFetched} pages, ${runner_groups.length} rows).`
                              : "Runner groups listed successfully.",
                        org: input.org,
                        total_count: firstTotalCount ?? runner_groups.length,
                        runner_groups,
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
                const response = await octokit.request("GET /orgs/{org}/actions/runner-groups", {
                    org: input.org,
                    ...visibleToRepository,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListSelfHostedRunnerGroupsForOrgSuccess = {
                    success: true,
                    message: "Runner groups listed successfully.",
                    org: input.org,
                    total_count: parsed.total_count,
                    runner_groups: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListSelfHostedRunnerGroupsForOrgFailure = {
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
