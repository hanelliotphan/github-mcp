import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoRulesetsFailure,
    ListRepoRulesetsSuccess,
    RepoRulesetListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_RULESETS_PER_PAGE = 100 as const;

function toPlainRulesets(rows: unknown[]): RepoRulesetListItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as RepoRulesetListItem);
}

type ListQueryInput = {
    owner: string;
    name: string;
    includes_parents?: boolean | undefined;
    targets?: string | undefined;
};

function buildGetRepoRulesetsParams(
    input: ListQueryInput,
    page: number,
    perPage: number
): Parameters<Octokit["rest"]["repos"]["getRepoRulesets"]>[0] {
    const params: Parameters<Octokit["rest"]["repos"]["getRepoRulesets"]>[0] = {
        owner: input.owner,
        repo: input.name,
        per_page: perPage,
        page
    };
    if (input.includes_parents !== undefined) {
        params.includes_parents = input.includes_parents;
    }
    if (input.targets != null && input.targets !== "") {
        params.targets = input.targets;
    }
    return params;
}

export function registerGithubListRepoRulesetsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_rulesets",
        "List repository rulesets (GET /repos/{owner}/{repo}/rulesets). " +
            "Returns ruleset definitions (name, enforcement, conditions, rules, etc.). " +
            "`includes_parents` defaults to **true** on GitHub (org/enterprise rulesets that apply to the repo). Set `includes_parents`: `false` to exclude them. " +
            "Optional `targets` is a comma-separated filter (e.g. `branch`, `tag`, `push`). " +
            "`bypass_actors` is only returned when the token has write access to the ruleset. " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
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
            includes_parents: z.boolean().optional(),
            targets: z.string().min(1).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const effectiveIncludesParents = input.includes_parents ?? true;
            const perPage = input.per_page ?? DEFAULT_RULESETS_PER_PAGE;

            const queryBase: ListQueryInput = {
                owner: input.owner,
                name: input.name,
                includes_parents: input.includes_parents,
                targets: input.targets
            };

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.repos.getRepoRulesets(
                                buildGetRepoRulesetsParams(queryBase, page, pp)
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
                    const rulesets = toPlainRulesets(result.rows);
                    const successPayload: ListRepoRulesetsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Rulesets partially listed (${result.pagesFetched} pages, ${rulesets.length} rulesets); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Rulesets retrieved successfully (${result.pagesFetched} pages, ${rulesets.length} rulesets).`
                              : "Rulesets retrieved successfully.",
                        rulesets,
                        includes_parents: effectiveIncludesParents,
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
                const response = await octokit.rest.repos.getRepoRulesets(
                    buildGetRepoRulesetsParams(queryBase, page, perPage)
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: ListRepoRulesetsSuccess = {
                    success: true,
                    message: "Rulesets retrieved successfully.",
                    rulesets: toPlainRulesets(rows),
                    includes_parents: effectiveIncludesParents,
                    targets: input.targets,
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoRulesetsFailure = {
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
