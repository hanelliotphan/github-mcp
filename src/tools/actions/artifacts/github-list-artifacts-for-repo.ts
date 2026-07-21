import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ArtifactItem,
    ListArtifactsForRepoFailure,
    ListArtifactsForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const DEFAULT_ARTIFACTS_PER_PAGE = 100 as const;

function parseArtifactsBody(data: unknown): { total_count: number; artifacts: unknown[] } {
    if (data && typeof data === "object" && "artifacts" in data) {
        const o = data as Record<string, unknown>;
        const artifacts = Array.isArray(o.artifacts) ? o.artifacts : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : artifacts.length;
        return { total_count, artifacts };
    }
    return { total_count: 0, artifacts: [] };
}

function toPlainArtifacts(rows: unknown[]): ArtifactItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as ArtifactItem);
}

export function registerGithubListArtifactsForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_artifacts_for_repo",
        "List GitHub Actions artifacts for a repository (GET /repos/{owner}/{repo}/actions/artifacts). " +
            "Returns **`total_count`** and **`artifacts`** rows (`id`, `name`, `size_in_bytes`, `archive_download_url`, `expired`, `created_at`, `expires_at`, `workflow_run`, …). " +
            "Optional **`name`** filters to artifacts with that exact name. " +
            "Anyone with **read** access can use this; classic tokens need **`repo`** scope for private repositories. " +
            "Use `per_page` (1–100, default **100** when omitted) and `page`; set `all_pages` to follow `next` links up to `max_pages` (default **100**). " +
            "See [List artifacts for a repository](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#list-artifacts-for-a-repository).",
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
            artifact_name: z
                .string()
                .min(1)
                .optional()
                .describe("Filter to artifacts with this exact name (GitHub's `name` query parameter)."),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            const perPage = input.per_page ?? DEFAULT_ARTIFACTS_PER_PAGE;

            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    let firstTotalCount: number | undefined;
                    const result = await fetchAllPageLinkPages({
                        perPage,
                        maxPages,
                        fetchPage: async (page, pp) => {
                            const response = await octokit.rest.actions.listArtifactsForRepo({
                                owner: input.owner,
                                repo: input.name,
                                name: input.artifact_name,
                                per_page: pp,
                                page
                            });
                            const parsed = parseArtifactsBody(response.data);
                            if (firstTotalCount === undefined) {
                                firstTotalCount = parsed.total_count;
                            }
                            return {
                                rows: parsed.artifacts,
                                linkHeader: getLinkHeaderFromResponse(
                                    response.headers as { link?: string; Link?: string }
                                ),
                                requestId: getRequestId(response.headers["x-github-request-id"])
                            };
                        }
                    });
                    const artifacts = toPlainArtifacts(result.rows);
                    const successPayload: ListArtifactsForRepoSuccess = {
                        success: true,
                        message: result.truncated
                            ? `Artifacts partially listed (${result.pagesFetched} pages, ${artifacts.length} rows); more pages exist.`
                            : result.pagesFetched > 1
                              ? `Artifacts listed successfully (${result.pagesFetched} pages, ${artifacts.length} rows).`
                              : "Artifacts listed successfully.",
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        total_count: firstTotalCount ?? artifacts.length,
                        artifacts,
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
                const response = await octokit.rest.actions.listArtifactsForRepo({
                    owner: input.owner,
                    repo: input.name,
                    name: input.artifact_name,
                    per_page: perPage,
                    page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const parsed = parseArtifactsBody(response.data);
                const successPayload: ListArtifactsForRepoSuccess = {
                    success: true,
                    message: "Artifacts listed successfully.",
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    total_count: parsed.total_count,
                    artifacts: toPlainArtifacts(parsed.artifacts),
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    request_id: requestId,
                    page,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListArtifactsForRepoFailure = {
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
