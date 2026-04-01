import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoWebhooksFailure,
    ListRepoWebhooksSuccess,
    RepoWebhookItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_WEBHOOKS_PER_PAGE = 100 as const;

function toPlainWebhooks(rows: unknown[]): RepoWebhookItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as RepoWebhookItem);
}

export function registerGithubListRepoWebhooksTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_webhooks",
        "List webhooks for a repository (GET /repos/{owner}/{repo}/hooks). " +
            "Returns hook **`id`**, **`events`**, **`config`**, **`active`**, **`last_response`**, etc. " +
            "`last_response` may be null if there have been no deliveries in the last 30 days (per GitHub). " +
            "Requires **`read:repo_hook`** or **`repo`** scope for classic tokens; fine-grained tokens need **Administration** read access (or broader) as required by GitHub. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List repository webhooks](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#list-repository-webhooks).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
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
                            const response = await octokit.rest.repos.listWebhooks({
                                owner: input.owner,
                                repo: input.name,
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
                    const successPayload: ListRepoWebhooksSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Webhooks partially listed (${result.pagesFetched} pages, ${webhooks.length} hooks); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Webhooks retrieved successfully (${result.pagesFetched} pages, ${webhooks.length} hooks).`
                              : "Webhooks retrieved successfully.",
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
                const response = await octokit.rest.repos.listWebhooks({
                    owner: input.owner,
                    repo: input.name,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: ListRepoWebhooksSuccess = {
                    success: true,
                    message: "Webhooks retrieved successfully.",
                    webhooks: toPlainWebhooks(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoWebhooksFailure = {
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
