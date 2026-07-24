import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgPrivateRegistriesFailure,
    ListOrgPrivateRegistriesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import {
    getLinkHeaderFromResponse,
    parseGitHubPageLinkPagination
} from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const DEFAULT_PER_PAGE = 100 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "configurations" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.configurations) ? o.configurations : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row ?? {})) as Record<string, unknown>);
}

export function registerGithubListOrgPrivateRegistriesTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_list_org_private_registries",
        "List private registry configurations for an organization (GET /orgs/{org}/private-registries). " +
            "Returns **`total_count`** and **`configurations`** without encrypted values. Requires **`admin:org`**. " +
            "Page pagination with **`per_page`**, **`page`**, **`all_pages`**, and **`max_pages`**. " +
            "See [List private registries for an organization](https://docs.github.com/en/rest/private-registries/organization-configurations?apiVersion=2026-03-10#list-private-registries-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
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
                            const response = await octokit.rest.privateRegistries.listOrgPrivateRegistries(
                                {
                                    org: input.org,
                                    per_page: pp,
                                    page
                                }
                            );
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
                    const configurations = toPlainRows(result.rows);
                    const successPayload: ListOrgPrivateRegistriesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Private registries partially listed (${result.pagesFetched} pages, ${configurations.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Private registries retrieved successfully (${result.pagesFetched} pages, ${configurations.length} items).`
                              : "Private registries retrieved successfully.",
                        org: input.org,
                        total_count: firstTotalCount ?? configurations.length,
                        configurations,
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
                const response = await octokit.rest.privateRegistries.listOrgPrivateRegistries({
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: ListOrgPrivateRegistriesSuccess = {
                    success: true,
                    message: "Private registries retrieved successfully.",
                    org: input.org,
                    total_count: parsed.total_count,
                    configurations: toPlainRows(parsed.rows),
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
                const failurePayload: ListOrgPrivateRegistriesFailure = {
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
