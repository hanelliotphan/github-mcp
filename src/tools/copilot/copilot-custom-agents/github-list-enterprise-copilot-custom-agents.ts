import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListEnterpriseCopilotCustomAgentsSuccess, ListEnterpriseCopilotCustomAgentsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListEnterpriseCopilotCustomAgentsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_enterprise_copilot_custom_agents",
        "List custom agents for an enterprise (GET /enterprises/{enterprise}/copilot/custom-agents). Returns custom_agents (may be null). Supports per_page/page and all_pages when Link headers are present. See [Get custom agents for an enterprise](https://docs.github.com/en/rest/copilot/copilot-custom-agents?apiVersion=2026-03-10#get-custom-agents-for-an-enterprise).",
        {
            enterprise: z.string().min(1).max(39).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug (1–39 chars, alphanumeric and hyphens)"),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
function parseBody(data: unknown): { rows: unknown[] | null } {
    if (data && typeof data === "object" && "custom_agents" in data) {
        const o = data as Record<string, unknown>;
        const rows = o.custom_agents === null ? null : Array.isArray(o.custom_agents) ? o.custom_agents : [];
        return { rows };
    }
    return { rows: null };
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
                                "GET /enterprises/{enterprise}/copilot/custom-agents",
                                {
                                    enterprise: input.enterprise,
                    per_page: pp,
                    page
                                } as never
                            );
                            const parsed = parseBody(response.data);
                            
                            return {
                                rows: (parsed.rows ?? []),
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const parsed = { rows: result.rows };
                    const successPayload: ListEnterpriseCopilotCustomAgentsSuccess = {
                        success: true,
                        message: result.truncated ? "Partially listed; more pages exist." : "Listed successfully.",
                        
                        enterprise: input.enterprise,
                        custom_agents: parsed.rows === null ? null : toPlain(parsed.rows),
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
                    "GET /enterprises/{enterprise}/copilot/custom-agents",
                    {
                        
                        enterprise: input.enterprise,
                        per_page: perPage,
                        page
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListEnterpriseCopilotCustomAgentsSuccess = {
                    success: true,
                    message: "Listed successfully.",
                    
                    enterprise: input.enterprise,
                    custom_agents: parsed.rows === null ? null : toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListEnterpriseCopilotCustomAgentsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
