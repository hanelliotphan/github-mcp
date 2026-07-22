import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgEventsForAuthenticatedUserFailure,
    ListOrgEventsForAuthenticatedUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 30 as const;

function toPlain(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

export function registerGithubListOrgEventsForAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_events_for_authenticated_user",
        "List an authenticated user's organization dashboard events (GET /users/{username}/events/orgs/{org}). " +
            "You must be authenticated as the given user to view this. " +
            "Note: this API is not built for real-time use—event latency can range from 30s to 6h. " +
            "Use `per_page` (1–100, default **30** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List organization events for the authenticated user](https://docs.github.com/en/rest/activity/events?apiVersion=2026-03-10#list-organization-events-for-the-authenticated-user).",
        {
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
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
                            const response = await octokit.rest.activity.listOrgEventsForAuthenticatedUser({
                                username: input.username,
                                org: input.org,
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
                    const events = toPlain(result.rows);
                    const successPayload: ListOrgEventsForAuthenticatedUserSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization dashboard events partially listed (${result.pagesFetched} pages, ${events.length} events); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization dashboard events listed successfully (${result.pagesFetched} pages, ${events.length} events).`
                              : "Organization dashboard events listed successfully.",
                        username: input.username,
                        org: input.org,
                        events,
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
                const response = await octokit.rest.activity.listOrgEventsForAuthenticatedUser({
                    username: input.username,
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string });
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgEventsForAuthenticatedUserSuccess = {
                    success: true,
                    message: "Organization dashboard events listed successfully.",
                    username: input.username,
                    org: input.org,
                    events: toPlain(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgEventsForAuthenticatedUserFailure = {
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
