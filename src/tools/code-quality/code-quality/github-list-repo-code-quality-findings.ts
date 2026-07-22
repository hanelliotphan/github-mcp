import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoCodeQualityFindingsFailure,
    ListRepoCodeQualityFindingsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListRepoCodeQualityFindingsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_code_quality_findings",
        "List code quality findings for a repository (GET /repos/{owner}/{repo}/code-quality/findings). " +
            "Optional \`direction\`/\`state\`; cursor pagination via \`before\`/\`after\`; supports \`all_pages\`/\`max_pages\`. " +
            "Classic tokens need \`repo\` (or \`public_repo\` for public repos). " +
            "See [List code quality findings for a repository](https://docs.github.com/en/rest/code-quality/code-quality?apiVersion=2026-03-10#list-code-quality-findings-for-a-repository).",
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
            direction: z.enum(["asc", "desc"]).optional(),
            state: z.enum(["open", "dismissed"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                ...(input.state !== undefined ? { state: input.state } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk: async (cursors) => {
                            const response = await octokit.request(
                                "GET /repos/{owner}/{repo}/code-quality/findings",
                                {
                                    owner: input.owner,
                                    repo: input.name,
                                    per_page: perPage,
                                    ...filters,
                                    ...(cursors.after ? { after: cursors.after } : {}),
                                    ...(cursors.before ? { before: cursors.before } : {})
                                } as never
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
                    const findings = result.rows.map((row) => toPlain(row));
                    const successPayload: ListRepoCodeQualityFindingsSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Code quality findings partially listed (${result.pagesFetched} pages, ${findings.length} findings); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Code quality findings retrieved successfully (${result.pagesFetched} pages, ${findings.length} findings).`
                              : "Code quality findings retrieved successfully.",
                        owner: input.owner,
                        name: input.name,
                        findings,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }

                const response = await octokit.request("GET /repos/{owner}/{repo}/code-quality/findings", {
                    owner: input.owner,
                    repo: input.name,
                    per_page: perPage,
                    ...filters,
                    ...(input.after ? { after: input.after } : {}),
                    ...(input.before ? { before: input.before } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListRepoCodeQualityFindingsSuccess = {
                    success: true,
                    message: "Code quality findings retrieved successfully.",
                    owner: input.owner,
                    name: input.name,
                    findings: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubLinkPagination(
                        getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })
                    ),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoCodeQualityFindingsFailure = {
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
