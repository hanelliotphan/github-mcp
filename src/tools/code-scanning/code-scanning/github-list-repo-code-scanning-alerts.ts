import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoCodeScanningAlertsSuccess, ListRepoCodeScanningAlertsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListRepoCodeScanningAlertsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_repo_code_scanning_alerts", "List code scanning alerts for a repository (GET /repos/{owner}/{repo}/code-scanning/alerts). Classic tokens need security_events or public_repo. See [List code scanning alerts for a repository](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#list-code-scanning-alerts-for-a-repository).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            tool_name: z.string().min(1).optional(),
            tool_guid: z.string().optional(),
            ref: z.string().min(1).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            sort: z.enum(["created", "number", "updated"]).optional(),
            state: z.enum(["open", "dismissed", "fixed"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        }, async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage, maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.codeScanning.listAlertsForRepo({
                                owner: input.owner, repo: input.name,
                                ...(input.tool_name !== undefined ? { tool_name: input.tool_name } : {}),
                                ...(input.tool_guid !== undefined ? { tool_guid: input.tool_guid } : {}),
                                ...(input.ref !== undefined ? { ref: input.ref } : {}),
                                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                                ...(input.state !== undefined ? { state: input.state } : {}),
                                per_page: pp, page: page
                            });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const alerts = result.rows.map((row) => toPlain(row));
                    const successPayload: ListRepoCodeScanningAlertsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Results partially listed (${result.pagesFetched} pages, ${alerts.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Results retrieved successfully (${result.pagesFetched} pages, ${alerts.length} items).`
                              : "Results retrieved successfully.",
                        owner: input.owner, name: input.name,
                        alerts,
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
                const response = await octokit.rest.codeScanning.listAlertsForRepo({
                                owner: input.owner, repo: input.name,
                                ...(input.tool_name !== undefined ? { tool_name: input.tool_name } : {}),
                                ...(input.tool_guid !== undefined ? { tool_guid: input.tool_guid } : {}),
                                ...(input.ref !== undefined ? { ref: input.ref } : {}),
                                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                                ...(input.state !== undefined ? { state: input.state } : {}),
                                per_page: perPage, page: page
                            });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoCodeScanningAlertsSuccess = {
                    success: true,
                    message: "Results retrieved successfully.",
                    owner: input.owner, name: input.name,
                    alerts: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoCodeScanningAlertsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
