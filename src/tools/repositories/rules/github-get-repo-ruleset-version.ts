import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoRulesetVersionFailure,
    GetRepoRulesetVersionSuccess,
    RepoRulesetVersionWithState
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainVersion(data: unknown): RepoRulesetVersionWithState {
    return JSON.parse(JSON.stringify(data)) as RepoRulesetVersionWithState;
}

export function registerGithubGetRepoRulesetVersionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_ruleset_version",
        "Get one historical snapshot of a repository ruleset (GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}). " +
            "The response includes version metadata (`version_id`, `actor`, `updated_at`) and **`state`** (the ruleset definition at that version). " +
            "Use **`version_id`** from `github_get_repo_ruleset_history`. " +
            "See [Get repository ruleset version](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-repository-ruleset-version).",
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
            version_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getRepoRulesetVersion({
                    owner: input.owner,
                    repo: input.name,
                    ruleset_id: input.ruleset_id,
                    version_id: input.version_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetRepoRulesetVersionSuccess = {
                    success: true,
                    message: "Ruleset version retrieved successfully.",
                    http_status: response.status,
                    ruleset_id: input.ruleset_id,
                    version_id: input.version_id,
                    version: toPlainVersion(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoRulesetVersionFailure = {
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
