import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoSecretScanningAlertsSuccess, ListRepoSecretScanningAlertsFailure } from "../../../types.js";
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


export function registerGithubListRepoSecretScanningAlertsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_secret_scanning_alerts",
        "List secret scanning alerts for a repository (GET /repos/{owner}/{repo}/secret-scanning/alerts). Classic tokens need repo or security_events. See [List secret scanning alerts for a repository](https://docs.github.com/en/rest/secret-scanning/secret-scanning?apiVersion=2026-03-10#list-secret-scanning-alerts-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            state: z.enum(["open", "resolved"]).optional(),
            secret_type: z.string().min(1).optional(),
            exclude_secret_types: z.string().min(1).optional(),
            exclude_providers: z.string().min(1).optional(),
            providers: z.string().min(1).optional(),
            resolution: z.string().min(1).optional(),
            assignee: z.string().min(1).optional(),
            sort: z.enum(["created", "updated"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            validity: z.string().min(1).optional(),
            is_publicly_leaked: z.boolean().optional(),
            is_multi_repo: z.boolean().optional(),
            hide_secret: z.boolean().optional(),
            is_bypassed: z.boolean().optional(),
            included_metadata: z.string().min(1).optional(),
            owner_email_hash: z.string().min(1).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional(),
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
                            const response = await octokit.rest.secretScanning.listAlertsForRepo({
                                owner: input.owner, repo: input.name,
                                                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.secret_type !== undefined ? { secret_type: input.secret_type } : {}),
                ...(input.exclude_secret_types !== undefined ? { exclude_secret_types: input.exclude_secret_types } : {}),
                ...(input.exclude_providers !== undefined ? { exclude_providers: input.exclude_providers } : {}),
                ...(input.providers !== undefined ? { providers: input.providers } : {}),
                ...(input.resolution !== undefined ? { resolution: input.resolution } : {}),
                ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                ...(input.validity !== undefined ? { validity: input.validity } : {}),
                ...(input.is_publicly_leaked !== undefined ? { is_publicly_leaked: input.is_publicly_leaked } : {}),
                ...(input.is_multi_repo !== undefined ? { is_multi_repo: input.is_multi_repo } : {}),
                ...(input.hide_secret !== undefined ? { hide_secret: input.hide_secret } : {}),
                ...(input.is_bypassed !== undefined ? { is_bypassed: input.is_bypassed } : {}),
                ...(input.included_metadata !== undefined ? { included_metadata: input.included_metadata } : {}),
                ...(input.owner_email_hash !== undefined ? { owner_email_hash: input.owner_email_hash } : {}),
                ...(input.before !== undefined ? { before: input.before } : {}),
                ...(input.after !== undefined ? { after: input.after } : {}),
                                per_page: pp,
                                page
                            });
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const alerts = result.rows.map((row) => toPlain(row));
                    const successPayload: ListRepoSecretScanningAlertsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Secret scanning alerts partially listed (${result.pagesFetched} pages, ${alerts.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Secret scanning alerts retrieved successfully (${result.pagesFetched} pages, ${alerts.length} items).`
                              : "Secret scanning alerts retrieved successfully.",
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
                const response = await octokit.rest.secretScanning.listAlertsForRepo({
                                owner: input.owner, repo: input.name,
                                                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.secret_type !== undefined ? { secret_type: input.secret_type } : {}),
                ...(input.exclude_secret_types !== undefined ? { exclude_secret_types: input.exclude_secret_types } : {}),
                ...(input.exclude_providers !== undefined ? { exclude_providers: input.exclude_providers } : {}),
                ...(input.providers !== undefined ? { providers: input.providers } : {}),
                ...(input.resolution !== undefined ? { resolution: input.resolution } : {}),
                ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                ...(input.validity !== undefined ? { validity: input.validity } : {}),
                ...(input.is_publicly_leaked !== undefined ? { is_publicly_leaked: input.is_publicly_leaked } : {}),
                ...(input.is_multi_repo !== undefined ? { is_multi_repo: input.is_multi_repo } : {}),
                ...(input.hide_secret !== undefined ? { hide_secret: input.hide_secret } : {}),
                ...(input.is_bypassed !== undefined ? { is_bypassed: input.is_bypassed } : {}),
                ...(input.included_metadata !== undefined ? { included_metadata: input.included_metadata } : {}),
                ...(input.owner_email_hash !== undefined ? { owner_email_hash: input.owner_email_hash } : {}),
                ...(input.before !== undefined ? { before: input.before } : {}),
                ...(input.after !== undefined ? { after: input.after } : {}),
                                per_page: perPage,
                                page
                            });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoSecretScanningAlertsSuccess = {
                    success: true,
                    message: "Secret scanning alerts retrieved successfully.",
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
                const failurePayload: ListRepoSecretScanningAlertsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
