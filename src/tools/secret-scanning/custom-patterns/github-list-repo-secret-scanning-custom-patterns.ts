import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoSecretScanningCustomPatternsSuccess, ListRepoSecretScanningCustomPatternsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const DEFAULT_PER_PAGE = 100 as const;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}


export function registerGithubListRepoSecretScanningCustomPatternsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_secret_scanning_custom_patterns",
        "List secret scanning custom patterns for a repository (GET /repos/{owner}/{repo}/secret-scanning/custom-patterns). Classic tokens need repo or security_events. See [List repository custom patterns](https://docs.github.com/en/rest/secret-scanning/custom-patterns?apiVersion=2026-03-10#list-repository-custom-patterns).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            state: z.enum(["published", "unpublished"]).optional(),
            push_protection: z.enum(["enabled", "disabled"]).optional(),
            sort: z.enum(["created", "updated", "name"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.push_protection !== undefined ? { push_protection: input.push_protection } : {}),
                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                ...(input.direction !== undefined ? { direction: input.direction } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /repos/{owner}/{repo}/secret-scanning/custom-patterns",
                                { owner: input.owner, repo: input.name, ...filters, per_page: pp, page } as never
                            );
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const custom_patterns = result.rows.map((row) => toPlain(row));
                    const successPayload: ListRepoSecretScanningCustomPatternsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Custom patterns partially listed (${result.pagesFetched} pages, ${custom_patterns.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Custom patterns retrieved successfully (${result.pagesFetched} pages, ${custom_patterns.length} items).`
                              : "Custom patterns retrieved successfully.",
                        owner: input.owner, name: input.name,
                        custom_patterns,
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
                const response = await octokit.request("GET /repos/{owner}/{repo}/secret-scanning/custom-patterns", {
                    owner: input.owner, repo: input.name,
                    ...filters,
                    per_page: perPage,
                    page
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoSecretScanningCustomPatternsSuccess = {
                    success: true,
                    message: "Custom patterns retrieved successfully.",
                    owner: input.owner, name: input.name,
                    custom_patterns: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoSecretScanningCustomPatternsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
