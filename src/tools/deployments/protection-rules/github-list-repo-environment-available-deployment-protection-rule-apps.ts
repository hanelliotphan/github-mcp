import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess, ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsFailure } from "../../../types.js";
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

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "available_custom_deployment_protection_rule_integrations" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.available_custom_deployment_protection_rule_integrations) ? o.available_custom_deployment_protection_rule_integrations : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

export function registerGithubListRepoEnvironmentAvailableDeploymentProtectionRuleAppsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_environment_available_deployment_protection_rule_apps",
        "List custom deployment protection rule integrations available for a repository environment. Returns **`total_count`** and **`available_custom_deployment_protection_rule_integrations`**. Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. See [List custom deployment rule integrations](https://docs.github.com/en/rest/deployments/protection-rules?apiVersion=2026-03-10#list-custom-deployment-rule-integrations-available-for-an-environment).",
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
            environment_name: z.string().min(1).describe("The name of the environment."),
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
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.listCustomDeploymentRuleIntegrations({
                                owner: input.owner,
                                repo: input.name,
                                environment_name: input.environment_name,
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
                    const rows = toPlainRows(result.rows);
                    const successPayload: ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Available deployment protection rule integrations partially listed (${result.pagesFetched} pages, ${rows.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Available deployment protection rule integrations retrieved successfully (${result.pagesFetched} pages, ${rows.length} items).`
                              : "Available deployment protection rule integrations retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        environment_name: input.environment_name,
                        total_count: firstTotalCount ?? rows.length,
                        available_custom_deployment_protection_rule_integrations: rows,
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
                const response = await octokit.rest.repos.listCustomDeploymentRuleIntegrations({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsSuccess = {
                    success: true,
                    message: "Available deployment protection rule integrations retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    environment_name: input.environment_name,
                    total_count: parsed.total_count,
                    available_custom_deployment_protection_rule_integrations: toPlainRows(parsed.rows),
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
                const failurePayload: ListRepoEnvironmentAvailableDeploymentProtectionRuleAppsFailure = {
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
