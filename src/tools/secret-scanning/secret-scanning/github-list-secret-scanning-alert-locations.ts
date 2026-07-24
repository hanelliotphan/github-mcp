import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListSecretScanningAlertLocationsSuccess, ListSecretScanningAlertLocationsFailure } from "../../../types.js";
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


export function registerGithubListSecretScanningAlertLocationsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_secret_scanning_alert_locations",
        "List locations for a secret scanning alert (GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations). See [List locations for a secret scanning alert](https://docs.github.com/en/rest/secret-scanning/secret-scanning?apiVersion=2026-03-10#list-locations-for-a-secret-scanning-alert).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive(),
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
                            const response = await octokit.rest.secretScanning.listLocationsForAlert({
                                owner: input.owner,
                                repo: input.name,
                                alert_number: input.alert_number,
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
                    const locations = result.rows.map((row) => toPlain(row));
                    const successPayload: ListSecretScanningAlertLocationsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Locations partially listed (${result.pagesFetched} pages, ${locations.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Locations retrieved successfully (${result.pagesFetched} pages, ${locations.length} items).`
                              : "Locations retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        alert_number: input.alert_number,
                        locations,
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
                const response = await octokit.rest.secretScanning.listLocationsForAlert({
                    owner: input.owner,
                    repo: input.name,
                    alert_number: input.alert_number,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListSecretScanningAlertLocationsSuccess = {
                    success: true,
                    message: "Locations retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    locations: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListSecretScanningAlertLocationsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
