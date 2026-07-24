import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgRepositorySecurityAdvisoriesFailure,
    ListOrgRepositorySecurityAdvisoriesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const DEFAULT_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => toPlain(row));
}

export function registerGithubListOrgRepositorySecurityAdvisoriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_repository_security_advisories",
        "List repository security advisories for an organization (GET /orgs/{org}/security-advisories). Uses cursor pagination (`after` / `before`). Set `all_pages` to follow `next` up to `max_pages` (default **100**). `per_page` defaults to **100** when omitted (GitHub max **100**). See [List repository security advisories for an organization](https://docs.github.com/en/rest/security-advisories/repository-advisories?apiVersion=2026-03-10#list-repository-security-advisories-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            direction: z.enum(["asc", "desc"]).optional(),
            sort: z.enum(["created", "updated", "published"]).optional(),
            state: z.enum(["triage", "draft", "published", "closed"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().optional(),
            after: z.string().optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;

                const fetchChunk = async (cursors: { after?: string; before?: string }) => {
                    const response = await octokit.rest.securityAdvisories.listOrgRepositoryAdvisories({
                        org: input.org,
                        ...(input.direction !== undefined ? { direction: input.direction } : {}),
                        ...(input.sort !== undefined ? { sort: input.sort } : {}),
                        ...(input.state !== undefined ? { state: input.state } : {}),
                        per_page: perPage,
                        before: cursors.before,
                        after: cursors.after
                    });
                    return {
                        rows: Array.isArray(response.data) ? response.data : [],
                        linkHeader: getLinkHeaderFromResponse(response.headers),
                        requestId: getRequestId(response.headers["x-github-request-id"])
                    };
                };

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk
                    });
                    const advisories = toPlainList(result.rows);
                    const successPayload: ListOrgRepositorySecurityAdvisoriesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization repository security advisories partially listed (${result.pagesFetched} pages, ${advisories.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization repository security advisories retrieved successfully (${result.pagesFetched} pages, ${advisories.length} items).`
                              : "Organization repository security advisories retrieved successfully.",
                        org: input.org,
                        advisories,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const { rows, linkHeader, requestId } = await fetchChunk({
                    after: input.after,
                    before: input.before
                });
                const successPayload: ListOrgRepositorySecurityAdvisoriesSuccess = {
                    success: true,
                    message: "Organization repository security advisories retrieved successfully.",
                    org: input.org,
                    advisories: toPlainList(rows),
                    pagination: parseGitHubLinkPagination(linkHeader),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgRepositorySecurityAdvisoriesFailure = {
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
