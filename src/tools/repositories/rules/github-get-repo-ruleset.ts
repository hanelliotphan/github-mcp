import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoRulesetFailure,
    GetRepoRulesetSuccess,
    RepoRulesetListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainRuleset(data: unknown): RepoRulesetListItem {
    return JSON.parse(JSON.stringify(data)) as RepoRulesetListItem;
}

export function registerGithubGetRepoRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_ruleset",
        "Get one repository ruleset by ID (GET /repos/{owner}/{repo}/rulesets/{ruleset_id}). " +
            "Use `ruleset_id` from `github_list_repo_rulesets`. " +
            "Optional `includes_parents` defaults to **true** (GitHub includes parent org/enterprise context). " +
            "`bypass_actors` is only returned when the token has **write** access to the ruleset. " +
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
            ruleset_id: z.number().int().positive(),
            includes_parents: z.boolean().optional()
        },
        async (input) => {
            const effectiveIncludesParents = input.includes_parents ?? true;

            try {
                const params: Parameters<Octokit["rest"]["repos"]["getRepoRuleset"]>[0] = {
                    owner: input.owner,
                    repo: input.name,
                    ruleset_id: input.ruleset_id
                };
                if (input.includes_parents !== undefined) {
                    params.includes_parents = input.includes_parents;
                }

                const response = await octokit.rest.repos.getRepoRuleset(params);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetRepoRulesetSuccess = {
                    success: true,
                    message: "Ruleset retrieved successfully.",
                    http_status: response.status,
                    ruleset: toPlainRuleset(response.data),
                    includes_parents: effectiveIncludesParents,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoRulesetFailure = {
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
