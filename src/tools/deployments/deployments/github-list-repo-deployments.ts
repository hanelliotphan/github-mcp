import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoDeploymentsSuccess, ListRepoDeploymentsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListRepoDeploymentsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_deployments",
        "List deployments for a repository. Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. See [List deployments](https://docs.github.com/en/rest/deployments/deployments?apiVersion=2026-03-10#list-deployments).",
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
            sha: z.string().optional().describe("The SHA recorded at creation time."),
            ref: z.string().optional().describe("The name of the ref (branch, tag, or SHA)."),
            task: z.string().optional().describe("The name of the task for the deployment."),
            environment: z.union([z.string(), z.null()]).optional().describe("The name of the environment; pass null to filter deployments with no environment."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listDeployments({
                                owner: input.owner,
                                repo: input.name,
                                ...(input.sha !== undefined ? { sha: input.sha } : {}),
                                ...(input.ref !== undefined ? { ref: input.ref } : {}),
                                ...(input.task !== undefined ? { task: input.task } : {}),
                                ...(input.environment !== undefined ? { environment: input.environment } : {}),
                                per_page: pp,
                                page
                            });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const rows = toPlainRows(result.rows);
                    const successPayload: ListRepoDeploymentsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Deployments partially listed (${result.pagesFetched} pages, ${rows.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Deployments retrieved successfully (${result.pagesFetched} pages, ${rows.length} items).`
                              : "Deployments retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        
                        deployments: rows,
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
                const response = await octokit.rest.repos.listDeployments({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.sha !== undefined ? { sha: input.sha } : {}),
                                ...(input.ref !== undefined ? { ref: input.ref } : {}),
                                ...(input.task !== undefined ? { task: input.task } : {}),
                                ...(input.environment !== undefined ? { environment: input.environment } : {}),
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoDeploymentsSuccess = {
                    success: true,
                    message: "Deployments retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    
                    deployments: toPlainRows(rows),
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
                const failurePayload: ListRepoDeploymentsFailure = {
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
