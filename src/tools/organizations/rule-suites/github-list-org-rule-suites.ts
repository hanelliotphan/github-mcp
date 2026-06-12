import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgRuleSuitesFailure,
    ListOrgRuleSuitesSuccess,
    OrgRuleSuiteRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRuleSuites(rows: unknown[]): OrgRuleSuiteRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgRuleSuiteRow);
}

export function registerGithubListOrgRuleSuitesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_rule_suites",
        "List **organization rule suites** — suites of rule evaluations at the org level (GET /orgs/{org}/rulesets/rule-suites). " +
            "Returns rule suite rows (`id`, `actor_name`, `ref`, `repository_name`, `pushed_at`, `result`, `evaluation_result`, …). " +
            "Filters: **`ref`**, **`repository_name`**, **`time_period`** (`hour`/`day`/`week`/`month`, default `day`), **`actor_name`**, **`rule_suite_result`** (`pass`/`fail`/`bypass`/`all`, default `all`), **`evaluate_status`** (`all`/`active`/`evaluate`, default `all`). " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success; **404**, **500** on errors. " +
            "See [List organization rule suites](https://docs.github.com/en/rest/orgs/rule-suites?apiVersion=2026-03-10#list-organization-rule-suites).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            ref: z
                .string()
                .min(1)
                .optional()
                .describe(
                    "Ref name (no wildcards). Prefix with refs/heads/ for branches or refs/tags/ for tags; omit prefix to search all refs."
                ),
            repository_name: z.string().min(1).optional().describe("Repository name to filter on."),
            time_period: z
                .enum(["hour", "day", "week", "month"])
                .optional()
                .describe("Time period to filter by. Default: day."),
            actor_name: z
                .string()
                .min(1)
                .max(39)
                .regex(usernameRegex, "actor_name must be a valid GitHub login")
                .optional()
                .describe("GitHub user handle to filter evaluations triggered by this actor."),
            rule_suite_result: z
                .enum(["pass", "fail", "bypass", "all"])
                .optional()
                .describe("Rule suite results to filter on. Default: all."),
            evaluate_status: z
                .enum(["all", "active", "evaluate"])
                .optional()
                .describe(
                    "Evaluate status filter: all rule suites, only active rulesets, or only evaluate-mode rulesets. Default: all."
                ),
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
                            const response = await octokit.request("GET /orgs/{org}/rulesets/rule-suites", {
                                org: input.org,
                                ref: input.ref,
                                repository_name: input.repository_name,
                                time_period: input.time_period,
                                actor_name: input.actor_name,
                                rule_suite_result: input.rule_suite_result,
                                evaluate_status: input.evaluate_status,
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
                    const rule_suites = toPlainRuleSuites(result.rows);
                    const successPayload: ListOrgRuleSuitesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Rule suites partially listed (${result.pagesFetched} pages, ${rule_suites.length} suites); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Rule suites listed successfully (${result.pagesFetched} pages, ${rule_suites.length} suites).`
                              : "Rule suites listed successfully.",
                        http_status: 200,
                        org: input.org,
                        rule_suites,
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
                const response = await octokit.request("GET /orgs/{org}/rulesets/rule-suites", {
                    org: input.org,
                    ref: input.ref,
                    repository_name: input.repository_name,
                    time_period: input.time_period,
                    actor_name: input.actor_name,
                    rule_suite_result: input.rule_suite_result,
                    evaluate_status: input.evaluate_status,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgRuleSuitesSuccess = {
                    success: true,
                    message: "Rule suites listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    rule_suites: toPlainRuleSuites(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgRuleSuitesFailure = {
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
