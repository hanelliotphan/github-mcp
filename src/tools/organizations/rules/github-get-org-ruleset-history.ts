import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgRulesetHistoryFailure,
    GetOrgRulesetHistorySuccess,
    OrgRulesetHistoryVersionItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_HISTORY_PER_PAGE = 100 as const;

function toPlainVersions(rows: unknown[]): OrgRulesetHistoryVersionItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgRulesetHistoryVersionItem);
}

function buildGetOrgRulesetHistoryParams(
    org: string,
    rulesetId: number,
    page: number,
    perPage: number
): Parameters<Octokit["rest"]["orgs"]["getOrgRulesetHistory"]>[0] {
    return {
        org,
        ruleset_id: rulesetId,
        per_page: perPage,
        page
    };
}

export function registerGithubGetOrgRulesetHistoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_ruleset_history",
        "List version **history** for an organization ruleset (GET /orgs/{org}/rulesets/{ruleset_id}/history). " +
            "Each entry includes **`version_id`**, **`actor`**, and **`updated_at`**. " +
            "Use **`ruleset_id`** from **`github_list_org_rulesets`**. " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success; **404**, **500** on errors. " +
            "See [Get organization ruleset history](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#get-organization-ruleset-history).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            ruleset_id: z
                .number()
                .int()
                .positive()
                .describe("The ID of the ruleset."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_HISTORY_PER_PAGE;

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.orgs.getOrgRulesetHistory(
                                buildGetOrgRulesetHistoryParams(input.org, input.ruleset_id, page, pp)
                            );
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
                    const versions = toPlainVersions(result.rows);
                    const successPayload: GetOrgRulesetHistorySuccess = {
                        success: true,
                        message: result.truncated
                            ? `Organization ruleset history partially listed (${result.pagesFetched} pages, ${versions.length} versions); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Organization ruleset history retrieved successfully (${result.pagesFetched} pages, ${versions.length} versions).`
                              : "Organization ruleset history retrieved successfully.",
                        http_status: 200,
                        org: input.org,
                        ruleset_id: input.ruleset_id,
                        versions,
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
                const response = await octokit.rest.orgs.getOrgRulesetHistory(
                    buildGetOrgRulesetHistoryParams(input.org, input.ruleset_id, page, perPage)
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: GetOrgRulesetHistorySuccess = {
                    success: true,
                    message: "Organization ruleset history retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    ruleset_id: input.ruleset_id,
                    versions: toPlainVersions(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgRulesetHistoryFailure = {
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
