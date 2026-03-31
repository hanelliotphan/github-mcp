import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoBranchRulesFailure,
    GetRepoBranchRulesSuccess,
    RepoBranchRuleDetailed
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (aligned with other MCP list tools). */
const DEFAULT_BRANCH_RULES_PER_PAGE = 100 as const;

function toPlainRules(rows: unknown[]): RepoBranchRuleDetailed[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as RepoBranchRuleDetailed);
}

export function registerGithubGetRepoBranchRulesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_branch_rules",
        "List active rules that would apply to a branch (GET /repos/{owner}/{repo}/rules/branches/{branch}). " +
            "The branch need not exist. Only **active** enforcement is returned (not evaluate/disabled rulesets). " +
            "Rules may come from repo or parent org/enterprise. " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; responses include `pagination`, `page`, `per_page`, `pages_fetched`. " +
            "Set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See GitHub REST docs for repository rules.",
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
            branch: z
                .string()
                .min(1)
                .max(255)
                .refine((b) => !b.includes("*") && !b.includes("?"), "branch must not contain wildcard characters (* or ?)"),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_BRANCH_RULES_PER_PAGE;

                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.getBranchRules({
                                owner: input.owner,
                                repo: input.name,
                                branch: input.branch,
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
                    const rules = toPlainRules(result.rows);
                    const successPayload: GetRepoBranchRulesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Branch rules partially listed (${result.pagesFetched} pages, ${rules.length} rules); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Branch rules retrieved successfully (${result.pagesFetched} pages, ${rules.length} rules).`
                              : "Branch rules retrieved successfully.",
                        branch: input.branch,
                        rules,
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
                const response = await octokit.rest.repos.getBranchRules({
                    owner: input.owner,
                    repo: input.name,
                    branch: input.branch,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: GetRepoBranchRulesSuccess = {
                    success: true,
                    message: "Branch rules retrieved successfully.",
                    branch: input.branch,
                    rules: toPlainRules(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoBranchRulesFailure = {
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
