import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgCopilotSeatsSuccess, ListOrgCopilotSeatsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListOrgCopilotSeatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_copilot_seats",
        "List all Copilot seat assignments for an organization (GET /orgs/{org}/copilot/billing/seats). Returns total_seats and seats. Use per_page/page; all_pages follows Link headers. See [List all Copilot seat assignments for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#list-all-copilot-seat-assignments-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
function parseBody(data: unknown): { total_seats: number; rows: unknown[] } {
    if (data && typeof data === "object" && "seats" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.seats) ? o.seats : [];
        const total_seats = typeof o.total_seats === "number" ? o.total_seats : rows.length;
        return { total_seats, rows };
    }
    return { total_seats: 0, rows: [] };
}
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalSeats: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.copilot.listCopilotSeats({ org: input.org, per_page: pp, page });
                            const parsed = parseBody(response.data);
                            if (firstTotalSeats === undefined) firstTotalSeats = parsed.total_seats;
                            return {
                                rows: parsed.rows,
                                linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const seats = toPlain(result.rows);
                    const successPayload: ListOrgCopilotSeatsSuccess = {
                        success: true,
                        message: result.truncated ? "Partially listed; more pages exist." : "Listed successfully.",
                        org: input.org,
                        total_seats: firstTotalSeats ?? seats.length,
                        seats,
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
                const response = await octokit.rest.copilot.listCopilotSeats({ org: input.org, per_page: perPage, page });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const parsed = parseBody(response.data);
                const successPayload: ListOrgCopilotSeatsSuccess = {
                    success: true,
                    message: "Listed successfully.",
                    org: input.org,
                    total_seats: parsed.total_seats,
                    seats: toPlain(parsed.rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgCopilotSeatsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
