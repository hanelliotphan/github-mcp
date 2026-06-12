import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgWebhooksFailure,
    ListOrgWebhooksSuccess,
    OrgWebhookItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_WEBHOOKS_PER_PAGE = 100 as const;

function toPlainWebhooks(rows: unknown[]): OrgWebhookItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgWebhookItem);
}

export function registerGithubListOrgWebhooksTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_webhooks",
        "List webhooks for an organization (GET /orgs/{org}/hooks). " +
            "Returns org hook rows: **`id`**, **`name`**, **`events`**, **`config`**, **`active`**, **`url`**, **`ping_url`**, etc. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "OAuth apps cannot list webhooks they did not create; users cannot list webhooks created by OAuth apps. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List organization webhooks](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#list-organization-webhooks).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_WEBHOOKS_PER_PAGE;

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.orgs.listWebhooks({
                                org: input.org,
                                per_page: pp,
                                page
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
                    const webhooks = toPlainWebhooks(result.rows);
                    const successPayload: ListOrgWebhooksSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Webhooks partially listed (${result.pagesFetched} pages, ${webhooks.length} hooks); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Webhooks retrieved successfully (${result.pagesFetched} pages, ${webhooks.length} hooks).`
                              : "Webhooks retrieved successfully.",
                        org: input.org,
                        webhooks,
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
                const response = await octokit.rest.orgs.listWebhooks({
                    org: input.org,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: ListOrgWebhooksSuccess = {
                    success: true,
                    message: "Webhooks retrieved successfully.",
                    org: input.org,
                    webhooks: toPlainWebhooks(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgWebhooksFailure = {
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
