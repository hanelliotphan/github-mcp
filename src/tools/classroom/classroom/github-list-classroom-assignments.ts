import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListClassroomAssignmentsFailure,
    ListClassroomAssignmentsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListClassroomAssignmentsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_classroom_assignments",
        "List assignments for a GitHub Classroom (GET /classrooms/{classroom_id}/assignments). " +
            "Requires classroom administrator. Closing down — removed after 2026-08-28. " +
            "Supports \`per_page\`/\`page\`/\`all_pages\`/\`max_pages\`. " +
            "See [List assignments for a classroom](https://docs.github.com/en/rest/classroom/classroom?apiVersion=2026-03-10#list-assignments-for-a-classroom).",
        {
            classroom_id: z.number().int().positive(),
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
                            const response = await octokit.request(
                                "GET /classrooms/{classroom_id}/assignments",
                                {
                                    classroom_id: input.classroom_id,
                                    per_page: pp,
                                    page
                                }
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
                    const assignments = result.rows.map((row) => toPlain(row));
                    const successPayload: ListClassroomAssignmentsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Classroom assignments partially listed (${result.pagesFetched} pages, ${assignments.length} assignments); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Classroom assignments retrieved successfully (${result.pagesFetched} pages, ${assignments.length} assignments).`
                              : "Classroom assignments retrieved successfully.",
                        classroom_id: input.classroom_id,
                        assignments,
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
                const response = await octokit.request("GET /classrooms/{classroom_id}/assignments", {
                    classroom_id: input.classroom_id,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListClassroomAssignmentsSuccess = {
                    success: true,
                    message: "Classroom assignments retrieved successfully.",
                    classroom_id: input.classroom_id,
                    assignments: rows.map((row) => toPlain(row)),
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
                const failurePayload: ListClassroomAssignmentsFailure = {
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
