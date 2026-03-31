import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoRulesetHistoryFailure,
    GetRepoRulesetHistorySuccess,
    RepoRulesetHistoryVersionItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_HISTORY_PER_PAGE = 100 as const;

function toPlainVersions(rows: unknown[]): RepoRulesetHistoryVersionItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as RepoRulesetHistoryVersionItem);
}

function buildGetRepoRulesetHistoryParams(
    owner: string,
    repo: string,
    rulesetId: number,
    page: number,
    perPage: number
): Parameters<Octokit["rest"]["repos"]["getRepoRulesetHistory"]>[0] {
    return {
        owner,
        repo,
        ruleset_id: rulesetId,
        per_page: perPage,
        page
    };
}

export function registerGithubGetRepoRulesetHistoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_ruleset_history",
        "List version history for a repository ruleset (GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history). " +
            "Each entry includes **`version_id`**, **`actor`**, and **`updated_at`**. " +
            "Use **`ruleset_id`** from `github_list_repo_rulesets`. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [Get repository ruleset history](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-repository-ruleset-history).",
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
            ruleset_id: z.number().int().positive(),
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
                            const response = await octokit.rest.repos.getRepoRulesetHistory(
                                buildGetRepoRulesetHistoryParams(
                                    input.owner,
                                    input.name,
                                    input.ruleset_id,
                                    page,
                                    pp
                                )
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
                    const versions = toPlainVersions(result.rows);
                    const successPayload: GetRepoRulesetHistorySuccess = {
                        success: true,
                        message: result.truncated
                            ? `Ruleset history partially listed (${result.pagesFetched} pages, ${versions.length} versions); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Ruleset history retrieved successfully (${result.pagesFetched} pages, ${versions.length} versions).`
                              : "Ruleset history retrieved successfully.",
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
                const response = await octokit.rest.repos.getRepoRulesetHistory(
                    buildGetRepoRulesetHistoryParams(input.owner, input.name, input.ruleset_id, page, perPage)
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const data = response.data;
                const rows = Array.isArray(data) ? data : [];
                const successPayload: GetRepoRulesetHistorySuccess = {
                    success: true,
                    message: "Ruleset history retrieved successfully.",
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
                const failurePayload: GetRepoRulesetHistoryFailure = {
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
