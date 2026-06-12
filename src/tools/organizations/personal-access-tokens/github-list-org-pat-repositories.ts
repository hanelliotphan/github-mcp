import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgPatRepositoriesFailure,
    ListOrgPatRepositoriesSuccess,
    OrgPatRepositoryRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (**100**; GitHub’s REST default is **30**). */
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRepositories(rows: unknown[]): OrgPatRepositoryRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgPatRepositoryRow);
}

export function registerGithubListOrgPatRepositoriesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_pat_repositories",
        "List **repositories** a fine-grained **personal access token** has access to (GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories). " +
            "Returns **minimal repository** rows per GitHub. **Only GitHub Apps can use this endpoint.** " +
            "Pagination: **`page`** / **`per_page`** (1–100; default **100** when omitted). " +
            "Set **`all_pages`** to follow `next` links up to **`max_pages`** (default **100**). " +
            "**200** on success; **403**, **404**, **500** on errors. " +
            "See [List repositories a fine-grained personal access token has access to](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#list-repositories-a-fine-grained-personal-access-token-has-access-to).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            pat_id: z
                .number()
                .int()
                .positive()
                .describe("Unique identifier of the fine-grained personal access token."),
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
                            const response = await octokit.request(
                                "GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories",
                                {
                                    org: input.org,
                                    pat_id: input.pat_id,
                                    per_page: pp,
                                    page
                                }
                            );
                            return {
                                rows: Array.isArray(response.data) ? response.data : [],
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const repositories = toPlainRepositories(result.rows);
                    const successPayload: ListOrgPatRepositoriesSuccess = {
                        success: true,
                        message: result.truncated
                            ? `PAT repositories partially listed (${result.pagesFetched} pages, ${repositories.length} repositories); more pages exist.`
                            : result.pagesFetched > 1
                              ? `PAT repositories listed successfully (${result.pagesFetched} pages, ${repositories.length} repositories).`
                              : "PAT repositories listed successfully.",
                        http_status: 200,
                        org: input.org,
                        pat_id: input.pat_id,
                        repositories,
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
                const response = await octokit.request(
                    "GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories",
                    {
                        org: input.org,
                        pat_id: input.pat_id,
                        per_page: perPage,
                        page
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgPatRepositoriesSuccess = {
                    success: true,
                    message: "PAT repositories listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    pat_id: input.pat_id,
                    repositories: toPlainRepositories(rows),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgPatRepositoriesFailure = {
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
