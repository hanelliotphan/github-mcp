import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetSubjectStatsFailure,
    GetSubjectStatsSuccess,
    SubjectStatRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlainSubjectStatRows(rows: unknown[]): SubjectStatRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as SubjectStatRow);
}

async function subjectStatsRequest(
    octokit: Octokit,
    input: {
        org: string;
        min_timestamp: string;
        max_timestamp?: string;
        page: number;
        per_page: number;
        direction?: "asc" | "desc";
        subject_name_substring?: string;
        sort?: string[];
    }
) {
    return octokit.request({
        method: "GET",
        url: "/orgs/{org}/insights/api/subject-stats",
        org: input.org,
        min_timestamp: input.min_timestamp,
        ...(input.max_timestamp !== undefined ? { max_timestamp: input.max_timestamp } : {}),
        page: input.page,
        per_page: input.per_page,
        ...(input.direction !== undefined ? { direction: input.direction } : {}),
        ...(input.subject_name_substring !== undefined
            ? { subject_name_substring: input.subject_name_substring }
            : {}),
        ...(input.sort !== undefined && input.sort.length > 0 ? { sort: input.sort } : {})
    });
}

export function registerGithubGetOrgSubjectStatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_subject_stats",
        "List API usage **subjects** (users and GitHub Apps) in an organization for a time window (GET /orgs/{org}/insights/api/subject-stats). " +
            "Each row includes **`subject_type`**, **`subject_name`**, **`subject_id`**, and request counts. " +
            "Requires **API Insights** for the org (see GitHub). **`min_timestamp`** is required (ISO 8601); **`max_timestamp`** is optional. " +
            "Optional: **`subject_name_substring`**, **`direction`**, **`sort`**, **`page`** / **`per_page`** (default **100** when omitted), **`all_pages`** / **`max_pages`**. " +
            "See [Get subject stats](https://docs.github.com/en/rest/orgs/api-insights?apiVersion=2026-03-10#get-subject-stats).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            min_timestamp: z
                .string()
                .min(1)
                .describe("ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ) — lower bound of the stats window."),
            max_timestamp: z
                .string()
                .min(1)
                .optional()
                .describe("Optional ISO 8601 upper bound; omit to use GitHub’s default window."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            sort: z.array(z.string().min(1)).max(20).optional(),
            subject_name_substring: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const sortFields = input.sort?.filter((s) => s.length > 0);

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let lastHttpStatus = 200;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await subjectStatsRequest(octokit, {
                                org: input.org,
                                min_timestamp: input.min_timestamp,
                                max_timestamp: input.max_timestamp,
                                page,
                                per_page: pp,
                                direction: input.direction,
                                subject_name_substring: input.subject_name_substring,
                                sort: sortFields
                            });
                            lastHttpStatus = response.status;
                            const rows = Array.isArray(response.data) ? response.data : [];
                            return {
                                rows,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const subject_stats = toPlainSubjectStatRows(result.rows);
                    const successPayload: GetSubjectStatsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Subject stats partially fetched (${result.pagesFetched} pages, ${subject_stats.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Subject stats fetched successfully (${result.pagesFetched} pages, ${subject_stats.length} rows).`
                              : "Subject stats fetched successfully.",
                        http_status: lastHttpStatus,
                        org: input.org,
                        min_timestamp: input.min_timestamp,
                        max_timestamp: input.max_timestamp ?? null,
                        subject_stats,
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
                const response = await subjectStatsRequest(octokit, {
                    org: input.org,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp,
                    page,
                    per_page: perPage,
                    direction: input.direction,
                    subject_name_substring: input.subject_name_substring,
                    sort: sortFields
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: GetSubjectStatsSuccess = {
                    success: true,
                    message: "Subject stats fetched successfully.",
                    http_status: response.status,
                    org: input.org,
                    min_timestamp: input.min_timestamp,
                    max_timestamp: input.max_timestamp ?? null,
                    subject_stats: toPlainSubjectStatRows(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetSubjectStatsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
