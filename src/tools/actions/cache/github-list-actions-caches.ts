import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ActionsCacheItem,
    ListActionsCachesFailure,
    ListActionsCachesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "actions_caches" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.actions_caches) ? o.actions_caches : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlain(rows: unknown[]): ActionsCacheItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as ActionsCacheItem);
}

export function registerGithubListActionsCachesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_actions_caches",
        "List GitHub Actions caches for a repository (GET /repos/{owner}/{repo}/actions/caches). " +
            "Returns **`total_count`** and **`actions_caches`** rows (`id`, `ref`, `key`, `version`, `last_accessed_at`, `created_at`, `size_in_bytes`). " +
            "Optional filters: **`ref`** (branch/tag/PR merge ref), **`key`** (explicit cache key), **`sort`** (`created_at`, `last_accessed_at`, `size_in_bytes`; default `last_accessed_at`), and **`direction`** (`asc`/`desc`; default `desc`). " +
            "Anyone with **read** access can use this; classic tokens need **`repo`** scope for private repositories. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List GitHub Actions caches for a repository](https://docs.github.com/en/rest/actions/cache?apiVersion=2026-03-10#list-github-actions-caches-for-a-repository).",
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
            ref: z
                .string()
                .min(1)
                .optional()
                .describe("Full git ref to filter caches, e.g. refs/heads/main or refs/pull/{number}/merge."),
            key: z.string().min(1).optional().describe("Explicit cache key to filter by."),
            sort: z
                .enum(["created_at", "last_accessed_at", "size_in_bytes"])
                .optional()
                .describe("Property to sort results by. Default: last_accessed_at."),
            direction: z.enum(["asc", "desc"]).optional().describe("Sort direction. Default: desc."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.ref ? { ref: input.ref } : {}),
                ...(input.key ? { key: input.key } : {}),
                ...(input.sort ? { sort: input.sort } : {}),
                ...(input.direction ? { direction: input.direction } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.actions.getActionsCacheList({
                                owner: input.owner,
                                repo: input.name,
                                ...filters,
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
                    const actions_caches = toPlain(result.rows);
                    const successPayload: ListActionsCachesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Caches partially listed (${result.pagesFetched} pages, ${actions_caches.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Caches listed successfully (${result.pagesFetched} pages, ${actions_caches.length} rows).`
                              : "Caches listed successfully.",
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        total_count: firstTotalCount ?? actions_caches.length,
                        actions_caches,
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
                const response = await octokit.rest.actions.getActionsCacheList({
                    owner: input.owner,
                    repo: input.name,
                    ...filters,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const parsed = parseBody(response.data);
                const successPayload: ListActionsCachesSuccess = {
                    success: true,
                    message: "Caches listed successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    total_count: parsed.total_count,
                    actions_caches: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListActionsCachesFailure = {
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
