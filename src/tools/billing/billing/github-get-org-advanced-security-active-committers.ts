import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgAdvancedSecurityActiveCommittersFailure,
    GetOrgAdvancedSecurityActiveCommittersSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_PER_PAGE = 100 as const;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

function parseBody(data: unknown): {
    repositories: Record<string, unknown>[];
    meta: Record<string, unknown>;
} {
    if (!data || typeof data !== "object") {
        return { repositories: [], meta: {} };
    }
    const o = data as Record<string, unknown>;
    const repositories = Array.isArray(o.repositories)
        ? (o.repositories as unknown[]).map((r) => toPlain(r))
        : [];
    const { repositories: _r, ...meta } = o;
    return { repositories, meta: toPlain(meta) };
}

export function registerGithubGetOrgAdvancedSecurityActiveCommittersTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_org_advanced_security_active_committers",
        "Get GitHub Advanced Security active committers for an organization " +
            "(GET /orgs/{org}/settings/billing/advanced-security). " +
            "Returns seat counts and per-repository committer breakdown. " +
            "Optional **advanced_security_product** (`code_security` or `secret_protection`) is required for standalone Code Scanning / Secret Protection products. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "Requires organization admin or billing manager access. " +
            "See [Get GitHub Advanced Security active committers for an organization](https://docs.github.com/en/rest/billing/billing?apiVersion=2026-03-10#get-github-advanced-security-active-committers-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            advanced_security_product: z
                .enum(["code_security", "secret_protection"])
                .optional()
                .describe(
                    "Required for standalone Code Scanning or Secret Protection products; cannot be used for other plans."
                ),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const query = {
                ...(input.advanced_security_product
                    ? { advanced_security_product: input.advanced_security_product }
                    : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstMeta: Record<string, unknown> = {};
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.request(
                                "GET /orgs/{org}/settings/billing/advanced-security",
                                {
                                    org: input.org,
                                    ...query,
                                    per_page: pp,
                                    page
                                }
                            );
                            const parsed = parseBody(response.data);
                            if (page === 1) {
                                firstMeta = parsed.meta;
                            }
                            return {
                                rows: parsed.repositories,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const successPayload: GetOrgAdvancedSecurityActiveCommittersSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Advanced Security active committers partially retrieved (${result.pagesFetched} pages); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Advanced Security active committers retrieved successfully (${result.pagesFetched} pages).`
                              : "Advanced Security active committers retrieved successfully.",
                        http_status: 200,
                        org: input.org,
                        billing: {
                            ...firstMeta,
                            repositories: result.rows.map((r) => toPlain(r))
                        },
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
                    "GET /orgs/{org}/settings/billing/advanced-security",
                    {
                        org: input.org,
                        ...query,
                        per_page: perPage,
                        page
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: GetOrgAdvancedSecurityActiveCommittersSuccess = {
                    success: true,
                    message: "Advanced Security active committers retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    billing: {
                        ...parsed.meta,
                        repositories: parsed.repositories
                    },
                    pagination: parseGitHubPageLinkPagination(
                        getLinkHeaderFromResponse(
                            response.headers as { link?: string; Link?: string }
                        )
                    ),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgAdvancedSecurityActiveCommittersFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
