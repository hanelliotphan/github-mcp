import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgCodeSecurityConfigurationRepositoriesSuccess, ListOrgCodeSecurityConfigurationRepositoriesFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const enterpriseSlugRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListOrgCodeSecurityConfigurationRepositoriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_code_security_configuration_repositories",
        "List repositories associated with an org code security configuration (GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories). Optional status filter. Classic tokens need read:org. See [Get repositories associated with a code security configuration](https://docs.github.com/en/rest/code-security/configurations?apiVersion=2026-03-10#get-repositories-associated-with-a-code-security-configuration).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            configuration_id: z.number().int().positive(),
            status: z.string().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk: async (cursors) => {
                            const response = await octokit.rest.codeSecurity.getRepositoriesForConfiguration({
                                org: input.org,
                                configuration_id: input.configuration_id,
                                ...(input.status !== undefined ? { status: input.status } : {}),
                                per_page: perPage,
                                ...(cursors.after ? { after: cursors.after } : {}),
                                ...(cursors.before ? { before: cursors.before } : {})
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
                    const repositories = result.rows.map((row) => toPlain(row));
                    const successPayload: ListOrgCodeSecurityConfigurationRepositoriesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Results partially listed (${result.pagesFetched} pages, ${repositories.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Results retrieved successfully (${result.pagesFetched} pages, ${repositories.length} items).`
                              : "Results retrieved successfully.",
                        org: input.org,
                        configuration_id: input.configuration_id,
                        repositories,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }
                const response = await octokit.rest.codeSecurity.getRepositoriesForConfiguration({
                                org: input.org,
                                configuration_id: input.configuration_id,
                                ...(input.status !== undefined ? { status: input.status } : {}),
                                per_page: perPage,
                                ...(input.after ? { after: input.after } : {}),
                    ...(input.before ? { before: input.before } : {})
                            });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgCodeSecurityConfigurationRepositoriesSuccess = {
                    success: true,
                    message: "Results retrieved successfully.",
                        org: input.org,
                        configuration_id: input.configuration_id,
                    repositories: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgCodeSecurityConfigurationRepositoriesFailure = {
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
