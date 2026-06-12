import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgPatsFailure,
    ListOrgPatsSuccess,
    OrgPatRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainPats(rows: unknown[]): OrgPatRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgPatRow);
}

export function registerGithubListOrgPatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_pats",
        "List **approved fine-grained personal access tokens** owned by org members that can access org resources (GET /orgs/{org}/personal-access-tokens). " +
            "Returns *organization programmatic access grant* rows (`id`, `owner`, `repository_selection`, `permissions`, `access_granted_at`, `token_id`, `token_name`, `token_expired`, …). " +
            "**Only GitHub Apps can use this endpoint.** " +
            "Filters: **`owner`** (usernames), **`repository`**, **`permission`**, **`last_used_before`** / **`last_used_after`** (ISO 8601 `YYYY-MM-DDTHH:MM:SSZ`), **`token_id`**. Sort with **`sort`** (`created_at`) and **`direction`** (`asc`/`desc`, default `desc`). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success; **403**, **404**, **422**, **500** on errors. " +
            "See [List fine-grained personal access tokens with access to organization resources](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#list-fine-grained-personal-access-tokens-with-access-to-organization-resources).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            sort: z.enum(["created_at"]).optional().describe("Property to sort by. Default: created_at."),
            direction: z.enum(["asc", "desc"]).optional().describe("Sort direction. Default: desc."),
            owner: z
                .array(z.string().min(1).max(39).regex(usernameRegex, "owner entries must be valid GitHub logins"))
                .min(1)
                .optional()
                .describe("Filter by a list of owner usernames."),
            repository: z.string().min(1).optional().describe("Filter by repository name."),
            permission: z.string().min(1).optional().describe("Filter by permission."),
            last_used_before: z
                .string()
                .regex(iso8601Regex, "last_used_before must be ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)")
                .optional(),
            last_used_after: z
                .string()
                .regex(iso8601Regex, "last_used_after must be ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)")
                .optional(),
            token_id: z
                .array(z.string().min(1))
                .min(1)
                .optional()
                .describe("Filter by a list of token IDs."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request("GET /orgs/{org}/personal-access-tokens", {
                                org: input.org,
                                sort: input.sort,
                                direction: input.direction,
                                owner: input.owner,
                                repository: input.repository,
                                permission: input.permission,
                                last_used_before: input.last_used_before,
                                last_used_after: input.last_used_after,
                                token_id: input.token_id,
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
                    const personal_access_tokens = toPlainPats(result.rows);
                    const successPayload: ListOrgPatsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization PATs partially listed (${result.pagesFetched} pages, ${personal_access_tokens.length} tokens); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization PATs listed successfully (${result.pagesFetched} pages, ${personal_access_tokens.length} tokens).`
                              : "Organization PATs listed successfully.",
                        http_status: 200,
                        org: input.org,
                        personal_access_tokens,
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
                const response = await octokit.request("GET /orgs/{org}/personal-access-tokens", {
                    org: input.org,
                    sort: input.sort,
                    direction: input.direction,
                    owner: input.owner,
                    repository: input.repository,
                    permission: input.permission,
                    last_used_before: input.last_used_before,
                    last_used_after: input.last_used_after,
                    token_id: input.token_id,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgPatsSuccess = {
                    success: true,
                    message: "Organization PATs listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    personal_access_tokens: toPlainPats(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgPatsFailure = {
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
