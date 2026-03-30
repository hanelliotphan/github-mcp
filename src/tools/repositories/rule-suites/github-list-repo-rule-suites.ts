import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoRuleSuitesFailure,
    ListRepoRuleSuitesSuccess,
    RepoRuleSuiteItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (aligned with other MCP list tools). */
const DEFAULT_RULE_SUITES_PER_PAGE = 100 as const;

const timePeriodSchema = z.enum(["hour", "day", "week", "month"]);
const ruleSuiteResultSchema = z.enum(["pass", "fail", "bypass", "all"]);

function normalizeRuleSuite(row: {
    id?: number;
    actor_id?: number;
    actor_name?: string;
    before_sha?: string;
    after_sha?: string;
    ref?: string;
    repository_id?: number;
    repository_name?: string;
    pushed_at?: string;
    result?: "pass" | "fail" | "bypass";
    evaluation_result?: "pass" | "fail" | "bypass";
}): RepoRuleSuiteItem {
    return {
        id: row.id ?? 0,
        actor_id: row.actor_id,
        actor_name: row.actor_name,
        before_sha: row.before_sha,
        after_sha: row.after_sha,
        ref: row.ref,
        repository_id: row.repository_id,
        repository_name: row.repository_name,
        pushed_at: row.pushed_at,
        result: row.result,
        evaluation_result: row.evaluation_result
    };
}

type ListQueryInput = {
    owner: string;
    name: string;
    ref?: string | undefined;
    time_period: "hour" | "day" | "week" | "month";
    actor_name?: string | undefined;
    rule_suite_result: "pass" | "fail" | "bypass" | "all";
};

function buildGetRepoRuleSuitesParams(
    input: ListQueryInput,
    page: number,
    perPage: number
): Parameters<Octokit["rest"]["repos"]["getRepoRuleSuites"]>[0] {
    const params: Parameters<Octokit["rest"]["repos"]["getRepoRuleSuites"]>[0] = {
        owner: input.owner,
        repo: input.name,
        time_period: input.time_period,
        rule_suite_result: input.rule_suite_result,
        per_page: perPage,
        page
    };
    if (input.ref != null && input.ref !== "") {
        params.ref = input.ref;
    }
    if (input.actor_name != null && input.actor_name !== "") {
        params.actor_name = input.actor_name;
    }
    return params;
}

export function registerGithubListRepoRuleSuitesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_rule_suites",
        "List ruleset evaluation history for a repository (GET /repos/{owner}/{repo}/rulesets/rule-suites; insights for configured rulesets, not the ruleset definitions themselves). " +
            "Requires access to view ruleset insights. " +
            "Optional filters: `ref` (branch/tag ref), `time_period` (hour, day default, week, month), `actor_name`, `rule_suite_result` (pass, fail, bypass, all default). " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; responses include `pagination`, `page`, `per_page`, `pages_fetched`, and filter echoes. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**); if `truncated` is true, continue with `pagination.next` or increase `max_pages`. " +
            "See GitHub REST docs under repository rulesets (rule suites / evaluations).",
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
            ref: z.string().min(1).optional(),
            time_period: timePeriodSchema.optional(),
            actor_name: z.string().min(1).optional(),
            rule_suite_result: ruleSuiteResultSchema.optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const effectiveTimePeriod = input.time_period ?? "day";
            const effectiveRuleSuiteResult = input.rule_suite_result ?? "all";
            const perPage = input.per_page ?? DEFAULT_RULE_SUITES_PER_PAGE;

            const queryBase: ListQueryInput = {
                owner: input.owner,
                name: input.name,
                ref: input.ref,
                time_period: effectiveTimePeriod,
                actor_name: input.actor_name,
                rule_suite_result: effectiveRuleSuiteResult
            };

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.getRepoRuleSuites(
                                buildGetRepoRuleSuitesParams(queryBase, page, pp)
                            );
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
                    const rule_suites = result.rows.map((row) =>
                        normalizeRuleSuite(row as Parameters<typeof normalizeRuleSuite>[0])
                    );
                    const successPayload: ListRepoRuleSuitesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Ruleset evaluations partially listed (${result.pagesFetched} pages, ${rule_suites.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Ruleset evaluations retrieved successfully (${result.pagesFetched} pages, ${rule_suites.length} rows).`
                              : "Ruleset evaluations retrieved successfully.",
                        rule_suites,
                        time_period: effectiveTimePeriod,
                        rule_suite_result: effectiveRuleSuiteResult,
                        ref: input.ref,
                        actor_name: input.actor_name,
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
                const response = await octokit.rest.repos.getRepoRuleSuites(
                    buildGetRepoRuleSuitesParams(queryBase, page, perPage)
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: ListRepoRuleSuitesSuccess = {
                    success: true,
                    message: "Ruleset evaluations retrieved successfully.",
                    rule_suites: rows.map((row) =>
                        normalizeRuleSuite(row as Parameters<typeof normalizeRuleSuite>[0])
                    ),
                    time_period: effectiveTimePeriod,
                    rule_suite_result: effectiveRuleSuiteResult,
                    ref: input.ref,
                    actor_name: input.actor_name,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoRuleSuitesFailure = {
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
