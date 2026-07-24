import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserPackagesSuccess, ListUserPackagesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import {
    getLinkHeaderFromResponse,
    parseGitHubPageLinkPagination
} from "../../../utils/parse-github-link-header.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListUserPackagesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_packages",
        "List packages for a user (GET /users/{username}/packages). Requires **package_type**. Optional **visibility**. Page pagination with **per_page**, **page**, **all_pages**, and **max_pages**. See [List packages for a user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#list-packages-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(loginRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            visibility: z.enum(["public", "private", "internal"]).optional(),
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
                            const response = await octokit.rest.packages.listPackagesForUser({
                                username: input.username,
                                package_type: input.package_type,
                                ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
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
                    const packages = toPlainRows(result.rows);
                    const successPayload: ListUserPackagesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `User packages partially listed (${result.pagesFetched} pages, ${packages.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `User packages retrieved successfully (${result.pagesFetched} pages, ${packages.length} items).`
                              : "User packages retrieved successfully.",
                        username: input.username,
                        packages,
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
                const response = await octokit.rest.packages.listPackagesForUser({
                    username: input.username,
                                package_type: input.package_type,
                                ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListUserPackagesSuccess = {
                    success: true,
                    message: "User packages retrieved successfully.",
                    username: input.username,
                    packages: toPlainRows(rows),
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
                const failurePayload: ListUserPackagesFailure = {
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
