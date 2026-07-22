import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoCodeScanningDismissalRequestsFailure,
    ListRepoCodeScanningDismissalRequestsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListRepoCodeScanningDismissalRequestsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_repo_code_scanning_dismissal_requests",
        "List dismissal requests for code scanning alerts for a repository (GET /repos/{owner}/{repo}/dismissal-requests/code-scanning). " +
            "Delegated alert dismissal must be enabled. Classic tokens need `security_events`. " +
            "See [List dismissal requests for code scanning alerts for a repository](https://docs.github.com/en/rest/code-scanning/alert-dismissal-requests?apiVersion=2026-03-10#list-dismissal-requests-for-code-scanning-alerts-for-a-repository).",
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
            reviewer: z.string().min(1).optional(),
            requester: z.string().min(1).optional(),
            time_period: z.enum(["hour", "day", "week", "month"]).optional(),
            request_status: z.enum(["open", "approved", "expired", "denied", "all"]).optional(),
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
                ...(input.request_status !== undefined ? { request_status: input.request_status } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /repos/{owner}/{repo}/dismissal-requests/code-scanning",
                                {
                                    owner: input.owner,
                                    repo: input.name,
                                    ...filters,
                                    per_page: pp,
                                    page
                                } as never
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
                    const successPayload: ListRepoCodeScanningDismissalRequestsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Dismissal requests partially listed (${result.pagesFetched} pages, ${dismissal_requests.length} requests); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Dismissal requests retrieved successfully (${result.pagesFetched} pages, ${dismissal_requests.length} requests).`
                              : "Dismissal requests retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
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
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/dismissal-requests/code-scanning",
                    {
                        owner: input.owner,
                        repo: input.name,
                        ...filters,
                        per_page: perPage,
                        page
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoCodeScanningDismissalRequestsSuccess = {
                    success: true,
                    message: "Dismissal requests retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
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
                const failurePayload: ListRepoCodeScanningDismissalRequestsFailure = {
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
