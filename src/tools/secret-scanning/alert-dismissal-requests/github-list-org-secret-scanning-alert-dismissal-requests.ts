import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgSecretScanningAlertDismissalRequestsSuccess, ListOrgSecretScanningAlertDismissalRequestsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const DEFAULT_PER_PAGE = 100 as const;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}


export function registerGithubListOrgSecretScanningAlertDismissalRequestsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_secret_scanning_alert_dismissal_requests",
        "List secret scanning alert dismissal requests for an organization (GET /orgs/{org}/dismissal-requests/secret-scanning). Classic tokens need security_events. See [List alert dismissal requests for secret scanning for an org](https://docs.github.com/en/enterprise-cloud@latest/rest/secret-scanning/alert-dismissal-requests?apiVersion=2026-03-10#list-alert-dismissal-requests-for-secret-scanning-for-an-org).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            reviewer: z.string().min(1).optional(),
            requester: z.string().min(1).optional(),
            time_period: z.enum(["hour", "day", "week", "month"]).optional(),
            request_status: z.enum(["completed", "cancelled", "approved", "expired", "denied", "open", "all"]).optional(),
            repository_name: z.string().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.reviewer !== undefined ? { reviewer: input.reviewer } : {}),
                ...(input.requester !== undefined ? { requester: input.requester } : {}),
                ...(input.time_period !== undefined ? { time_period: input.time_period } : {}),
                ...(input.request_status !== undefined ? { request_status: input.request_status } : {}),
                ...(input.repository_name !== undefined ? { repository_name: input.repository_name } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/dismissal-requests/secret-scanning",
                                { org: input.org, ...filters, per_page: pp, page } as never
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
                    const dismissal_requests = result.rows.map((row) => toPlain(row));
                    const successPayload: ListOrgSecretScanningAlertDismissalRequestsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Dismissal requests partially listed (${result.pagesFetched} pages, ${dismissal_requests.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Dismissal requests retrieved successfully (${result.pagesFetched} pages, ${dismissal_requests.length} items).`
                              : "Dismissal requests retrieved successfully.",
                        org: input.org,
                        dismissal_requests,
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
                const response = await octokit.request("GET /orgs/{org}/dismissal-requests/secret-scanning", {
                    org: input.org,
                    ...filters,
                    per_page: perPage,
                    page
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgSecretScanningAlertDismissalRequestsSuccess = {
                    success: true,
                    message: "Dismissal requests retrieved successfully.",
                    org: input.org,
                    dismissal_requests: rows.map((row) => toPlain(row)),
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
                const failurePayload: ListOrgSecretScanningAlertDismissalRequestsFailure = {
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
