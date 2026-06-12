import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgRulesetsFailure,
    ListOrgRulesetsSuccess,
    OrgRulesetListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRulesets(rows: unknown[]): OrgRulesetListItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgRulesetListItem);
}

export function registerGithubListOrgRulesetsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_rulesets",
        "List **organization repository rulesets** (GET /orgs/{org}/rulesets). " +
            "Returns repository ruleset objects (`id`, `name`, `target`, `enforcement`, `conditions`, `rules`, …). " +
            "Optional **`targets`** is a comma-separated filter (e.g. `branch`, `tag`, `push`). " +
            "`bypass_actors` is only returned when the token has write access to the ruleset. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success; **404**, **500** on errors. " +
            "See [Get all organization repository rulesets](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#get-all-organization-repository-rulesets).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            targets: z
                .string()
                .min(1)
                .optional()
                .describe("Comma-separated rule targets to filter by (e.g. branch, tag, push)."),
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
                            const response = await octokit.request("GET /orgs/{org}/rulesets", {
                                org: input.org,
                                targets: input.targets,
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
                    const rulesets = toPlainRulesets(result.rows);
                    const successPayload: ListOrgRulesetsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization rulesets partially listed (${result.pagesFetched} pages, ${rulesets.length} rulesets); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization rulesets listed successfully (${result.pagesFetched} pages, ${rulesets.length} rulesets).`
                              : "Organization rulesets listed successfully.",
                        http_status: 200,
                        org: input.org,
                        rulesets,
                        targets: input.targets,
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
                const response = await octokit.request("GET /orgs/{org}/rulesets", {
                    org: input.org,
                    targets: input.targets,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgRulesetsSuccess = {
                    success: true,
                    message: "Organization rulesets listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    rulesets: toPlainRulesets(rows),
                    targets: input.targets,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgRulesetsFailure = {
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
