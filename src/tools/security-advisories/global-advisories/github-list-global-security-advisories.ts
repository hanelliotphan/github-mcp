import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListGlobalSecurityAdvisoriesFailure,
    ListGlobalSecurityAdvisoriesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

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

function toCommaSeparated(value: string | string[] | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    return Array.isArray(value) ? value.join(",") : value;
}

export function registerGithubListGlobalSecurityAdvisoriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_global_security_advisories",
        "List global security advisories (GET /advisories). Uses cursor pagination (`after` / `before`). Set `all_pages` to follow `next` up to `max_pages` (default **100**). `per_page` defaults to **100** when omitted (GitHub max **100**). See [List global security advisories](https://docs.github.com/en/rest/security-advisories/global-advisories?apiVersion=2026-03-10#list-global-security-advisories).",
        {
            ghsa_id: z.string().min(1).optional(),
            type: z.enum(["reviewed", "malware", "unreviewed"]).optional(),
            cve_id: z.string().min(1).optional(),
            ecosystem: z
                .enum([
                    "rubygems",
                    "npm",
                    "pip",
                    "maven",
                    "nuget",
                    "composer",
                    "go",
                    "rust",
                    "erlang",
                    "actions",
                    "pub",
                    "other",
                    "swift"
                ])
                .optional(),
            severity: z.enum(["unknown", "low", "medium", "high", "critical"]).optional(),
            cwes: z.union([z.string(), z.array(z.string())]).optional(),
            is_withdrawn: z.boolean().optional(),
            affects: z.union([z.string(), z.array(z.string())]).optional(),
            published: z.string().min(1).optional(),
            updated: z.string().min(1).optional(),
            modified: z.string().min(1).optional(),
            epss_percentage: z.string().min(1).optional(),
            epss_percentile: z.string().min(1).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            sort: z.enum(["updated", "published", "epss_percentage", "epss_percentile"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().optional(),
            after: z.string().optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const cwes = toCommaSeparated(input.cwes);
                const affects = toCommaSeparated(input.affects);

                const fetchChunk = async (cursors: { after?: string; before?: string }) => {
                    const response = await octokit.rest.securityAdvisories.listGlobalAdvisories({
                        ...(input.ghsa_id !== undefined ? { ghsa_id: input.ghsa_id } : {}),
                        ...(input.type !== undefined ? { type: input.type } : {}),
                        ...(input.cve_id !== undefined ? { cve_id: input.cve_id } : {}),
                        ...(input.ecosystem !== undefined ? { ecosystem: input.ecosystem } : {}),
                        ...(input.severity !== undefined ? { severity: input.severity } : {}),
                        ...(cwes !== undefined ? { cwes } : {}),
                        ...(input.is_withdrawn !== undefined ? { is_withdrawn: input.is_withdrawn } : {}),
                        ...(affects !== undefined ? { affects } : {}),
                        ...(input.published !== undefined ? { published: input.published } : {}),
                        ...(input.updated !== undefined ? { updated: input.updated } : {}),
                        ...(input.modified !== undefined ? { modified: input.modified } : {}),
                        ...(input.epss_percentage !== undefined ? { epss_percentage: input.epss_percentage } : {}),
                        ...(input.epss_percentile !== undefined ? { epss_percentile: input.epss_percentile } : {}),
                        ...(input.direction !== undefined ? { direction: input.direction } : {}),
                        ...(input.sort !== undefined ? { sort: input.sort } : {}),
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
                    const successPayload: ListGlobalSecurityAdvisoriesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Global security advisories partially listed (${result.pagesFetched} pages, ${advisories.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Global security advisories retrieved successfully (${result.pagesFetched} pages, ${advisories.length} items).`
                              : "Global security advisories retrieved successfully.",
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
                const successPayload: ListGlobalSecurityAdvisoriesSuccess = {
                    success: true,
                    message: "Global security advisories retrieved successfully.",
                    advisories: toPlainList(rows),
                    pagination: parseGitHubLinkPagination(linkHeader),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListGlobalSecurityAdvisoriesFailure = {
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
