import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgProjectViewItemsSuccess,
    ListOrgProjectViewItemsFailure
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

export function registerGithubListOrgProjectViewItemsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_project_view_items",
        "List items for an organization project view (GET /orgs/{org}/projectsV2/{project_number}/views/{view_number}/items). " +
            "Uses cursor pagination (`after` / `before`). Set `all_pages` to follow `next` up to `max_pages` (default **100**). " +
            "`per_page` defaults to **100** when omitted (GitHub max **100**). " +
            "See [List items for an organization project view](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#list-items-for-an-organization-project-view).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            project_number: z.number().int().positive(),
            view_number: z.number().int().positive(),
            fields: z
                .array(z.number().int().positive())
                .optional()
                .describe("Field IDs to include; sent as comma-separated `fields` query"),

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
                    const params: Record<string, unknown> = {
                        org: input.org,
                        project_number: input.project_number,
                        view_number: input.view_number,
                        per_page: perPage,
                        before: cursors.before,
                        after: cursors.after
                    };
                    if (input.fields !== undefined && input.fields.length > 0) {
                        params.fields = input.fields.map(String).join(",");
                    }
                    const response = await octokit.request(
                        "GET /orgs/{org}/projectsV2/{project_number}/views/{view_number}/items",
                        params as never
                    );
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
                    const items = toPlainList(result.rows);
                    const successPayload: ListOrgProjectViewItemsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization project view items partially listed (${result.pagesFetched} pages, ${items.length} items); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization project view items retrieved successfully (${result.pagesFetched} pages, ${items.length} items).`
                              : "Organization project view items retrieved successfully.",
                        org: input.org,
                        project_number: input.project_number,
                        view_number: input.view_number,
                        items,
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
                const successPayload: ListOrgProjectViewItemsSuccess = {
                    success: true,
                    message: "Organization project view items retrieved successfully.",
                    org: input.org,
                    project_number: input.project_number,
                    view_number: input.view_number,
                    items: toPlainList(rows),
                    pagination: parseGitHubLinkPagination(linkHeader),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgProjectViewItemsFailure = {
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
