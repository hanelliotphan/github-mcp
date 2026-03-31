import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoRulesetFailure, DeleteRepoRulesetSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteRepoRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_ruleset",
        "Delete a repository ruleset (DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}). " +
            "Use **`ruleset_id`** from `github_list_repo_rulesets` or `github_get_repo_ruleset`. " +
            "Requires permission to manage repository rules. Success is HTTP **204** with no response body. " +
            "See [Delete a repository ruleset](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#delete-a-repository-ruleset).",
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
            ruleset_id: z.number().int().positive()
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.repos.deleteRepoRuleset({
                    owner: input.owner,
                    repo: input.name,
                    ruleset_id: input.ruleset_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: DeleteRepoRulesetSuccess = {
                    success: true,
                    message: "Repository ruleset deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    ruleset_id: input.ruleset_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoRulesetFailure = {
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
