import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListRepoTopicsFailure, ListRepoTopicsSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../utils/parse-github-link-header.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Default when `per_page` is omitted (MCP default; GitHub’s API default is 30). */
const DEFAULT_TOPICS_PER_PAGE = 100 as const;

export function registerGithubListRepoTopicsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_topics",
        "List repository topics (GET /repos/{owner}/{repo}/topics). " +
            "Returns the `names` array for the requested page. " +
            "Use `per_page` (1–100, default 100 when omitted) and `page`. " +
            "When more pages exist, the response includes `pagination` from the `Link` header. " +
            "Requires read access; classic tokens need public_repo or repo scope for public repos and repo for private (per GitHub).",
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
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_TOPICS_PER_PAGE;
                const response = await octokit.rest.repos.getAllTopics({
                    owner: input.owner,
                    repo: input.name,
                    per_page: perPage,
                    page: input.page
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const linkHeader = getLinkHeaderFromResponse(
                    response.headers as { link?: string; Link?: string }
                );
                const names = Array.isArray(response.data.names) ? response.data.names : [];
                const successPayload: ListRepoTopicsSuccess = {
                    success: true,
                    message: "Repository topics retrieved successfully.",
                    pagination: parseGitHubPageLinkPagination(linkHeader),
                    names,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoTopicsFailure = {
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
