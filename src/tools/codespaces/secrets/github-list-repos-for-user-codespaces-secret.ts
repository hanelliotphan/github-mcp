import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListReposForUserCodespacesSecretFailure,
    ListReposForUserCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
const DEFAULT_PER_PAGE = 100 as const;
function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.repositories) ? o.repositories : [];
        return { total_count: typeof o.total_count === "number" ? o.total_count : rows.length, rows };
    }
    return { total_count: 0, rows: [] };
}
function toPlain(rows: unknown[]): Record<string, unknown>[] { return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>); }
export function registerGithubListReposForUserCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_repos_for_user_codespaces_secret", "List repositories for user codespaces secret. See GitHub REST secrets.", { secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional() }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        try {
            if (input.all_pages === true) {
                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                let firstTotalCount: number | undefined;
                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {
                    const response = await octokit.request("GET /user/codespaces/secrets/{secret_name}/repositories", { secret_name: input.secret_name, per_page: pp, page });
                    const parsed = parseBody(response.data);
                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;
                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                }});
                const repositories = toPlain(result.rows);
                return textAndData({ success: true, message: "Repositories listed successfully.", secret_name: input.secret_name, total_count: firstTotalCount ?? repositories.length, repositories, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ListReposForUserCodespacesSecretSuccess);
            }
            const page = input.page ?? 1;
            const response = await octokit.request("GET /user/codespaces/secrets/{secret_name}/repositories", { secret_name: input.secret_name, per_page: perPage, page });
            const parsed = parseBody(response.data);
            return textAndData({ success: true, message: "Repositories listed successfully.", secret_name: input.secret_name, total_count: parsed.total_count, repositories: toPlain(parsed.rows), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ListReposForUserCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies ListReposForUserCodespacesSecretFailure);
        }
    });
}