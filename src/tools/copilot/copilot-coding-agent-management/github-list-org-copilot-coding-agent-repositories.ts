import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgCopilotCodingAgentRepositoriesSuccess, ListOrgCopilotCodingAgentRepositoriesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListOrgCopilotCodingAgentRepositoriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_copilot_coding_agent_repositories",
        "List repositories enabled for Copilot cloud agent in an organization (GET /orgs/{org}/copilot/coding-agent/permissions/repositories). Returns total_count and repositories. Use per_page/page; all_pages follows Link headers. See [List repositories enabled for Copilot cloud agent in an organization](https://docs.github.com/en/rest/copilot/copilot-coding-agent-management?apiVersion=2026-03-10#list-repositories-enabled-for-copilot-cloud-agent-in-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "repositories" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.repositories) ? o.repositories : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/copilot/coding-agent/permissions/repositories",
                                {
                                    org: input.org,
                    per_page: pp,
                    page
                                } as never
                            );
                            const parsed = parseBody(response.data);
                            if (firstTotalCount === undefined) { firstTotalCount = parsed.total_count; }
                            return {
                                rows: parsed.rows,
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const parsed = { rows: result.rows };
                    const successPayload: ListOrgCopilotCodingAgentRepositoriesSuccess = {
                        success: true,
                        message: result.truncated ? "Partially listed; more pages exist." : "Listed successfully.",
                        org: input.org,
                        
                        repositories: toPlain(result.rows),
                        total_count: firstTotalCount ?? result.rows.length,
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
                const response = await octokit.request(
                    "GET /orgs/{org}/copilot/coding-agent/permissions/repositories",
                    {
                        org: input.org,
                        
                        per_page: perPage,
                        page
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListOrgCopilotCodingAgentRepositoriesSuccess = {
                    success: true,
                    message: "Listed successfully.",
                    org: input.org,
                    
                    repositories: toPlain(parsed.rows),
                    total_count: parsed.total_count,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgCopilotCodingAgentRepositoriesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
