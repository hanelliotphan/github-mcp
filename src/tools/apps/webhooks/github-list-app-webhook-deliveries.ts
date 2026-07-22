import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppWebhookDeliveryItem,
    ListAppWebhookDeliveriesFailure,
    ListAppWebhookDeliveriesSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorQueryLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubCursorQueryLinkPagination } from "../../../utils/parse-github-link-header.js";

const DEFAULT_DELIVERIES_PER_PAGE = 100 as const;

function toPlainDeliveries(rows: unknown[]): AppWebhookDeliveryItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as AppWebhookDeliveryItem);
}

async function listAppWebhookDeliveriesRequest(
    octokit: Octokit,
    input: {
        per_page: number;
        cursor?: string;
        status?: "success" | "failure";
    }
) {
    return octokit.rest.apps.listWebhookDeliveries({
        per_page: input.per_page,
        cursor: input.cursor,
        status: input.status
    });
}

export function registerGithubListAppWebhookDeliveriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_app_webhook_deliveries",
        "List deliveries for the GitHub App webhook (GET /app/hook/deliveries). " +
            "Returns summary rows (`id`, `guid`, `delivered_at`, `status_code`, `event`, …). " +
            "Pagination uses **`cursor`** (not page numbers): pass **`cursor`** from the previous response’s `pagination.next`, or set **`all_pages`** to follow `Link: rel=\"next\"` up to **`max_pages`** (default **100**). " +
            "Optional **`status`**: **`success`** (HTTP 200–399) or **`failure`** (400–599). " +
            "**`per_page`** is 1–100; default **100** when omitted (GitHub’s API default is 30). " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [List deliveries for an app webhook](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#list-deliveries-for-an-app-webhook).",
        {
            per_page: z.number().int().min(1).max(100).optional(),
            cursor: z.string().min(1).optional(),
            status: z.enum(["success", "failure"]).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_DELIVERIES_PER_PAGE;

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorQueryLinkPages({
                        perPage,
                        maxPages,
                        initialCursor: input.cursor,
                        fetchChunk: async (cursor) => {
                            const response = await listAppWebhookDeliveriesRequest(octokit, {
                                per_page: perPage,
                                cursor,
                                status: input.status
                            });
                            const data = response.data;
                            const rows = Array.isArray(data) ? data : [];
                            return {
                                rows,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const deliveries = toPlainDeliveries(result.rows);
                    const successPayload: ListAppWebhookDeliveriesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Deliveries partially listed (${result.pagesFetched} pages, ${deliveries.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Deliveries retrieved successfully (${result.pagesFetched} pages, ${deliveries.length} rows).`
                              : "Deliveries retrieved successfully.",
                        deliveries,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        cursor: input.cursor,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const response = await listAppWebhookDeliveriesRequest(octokit, {
                    per_page: perPage,
                    cursor: input.cursor,
                    status: input.status
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: ListAppWebhookDeliveriesSuccess = {
                    success: true,
                    message: "Deliveries retrieved successfully.",
                    deliveries: toPlainDeliveries(rows),
                    pagination: parseGitHubCursorQueryLinkPagination(linkHeader),
                    request_id: requestId,
                    cursor: input.cursor,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAppWebhookDeliveriesFailure = {
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
