import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRepoLanguagesFailure,
    ListRepoLanguagesSuccess,
    RepoLanguageItem
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function normalizeLanguages(data: Record<string, number>): RepoLanguageItem[] {
    return Object.entries(data)
        .map(([language, bytes]) => ({ language, bytes }))
        .sort((a, b) => b.bytes - a.bytes);
}

export function registerGithubListRepoLanguagesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_repo_languages",
        "List languages for a repository (GET /repos/{owner}/{repo}/languages). Each value is bytes of code in that language. Requires read access to the repository.",
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
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.listLanguages({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const languages = normalizeLanguages(response.data);
                const total_bytes = languages.reduce((sum, row) => sum + row.bytes, 0);

                const successPayload: ListRepoLanguagesSuccess = {
                    success: true,
                    message: "Repository languages retrieved successfully.",
                    languages,
                    total_bytes,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRepoLanguagesFailure = {
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
