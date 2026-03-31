import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RepoRulesetListItem,
    UpdateRepoRulesetFailure,
    UpdateRepoRulesetSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const rulesetUpdateBodySchema = z
    .object({
        name: z.string().min(1).optional(),
        enforcement: z.enum(["disabled", "active", "evaluate"]).optional(),
        target: z.enum(["branch", "tag", "push"]).optional(),
        bypass_actors: z.array(z.record(z.string(), z.unknown())).optional(),
        conditions: z.record(z.string(), z.unknown()).optional(),
        rules: z.array(z.record(z.string(), z.unknown())).optional()
    })
    .passthrough()
    .refine((body) => Object.keys(body).length > 0, {
        message: "ruleset must include at least one property to update (GitHub expects a non-empty JSON body)."
    });

function toPlainRuleset(data: unknown): RepoRulesetListItem {
    return JSON.parse(JSON.stringify(data)) as RepoRulesetListItem;
}

export function registerGithubUpdateRepoRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_ruleset",
        "Update a repository ruleset (PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}). " +
            "Pass **`ruleset`** with one or more fields to change (`name`, `enforcement`, `target`, `bypass_actors`, `conditions`, `rules`); extra keys are forwarded. " +
            "Use `github_list_repo_rulesets` or `github_get_repo_ruleset` for **`ruleset_id`**. " +
            "Requires admin/write access. Success is HTTP **200**. " +
            "See GitHub REST docs for [Update a repository ruleset](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#update-a-repository-ruleset).",
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
            ruleset: rulesetUpdateBodySchema.describe(
                "Fields to set on the ruleset (subset of create body; at least one key required)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateRepoRuleset({
                    owner: input.owner,
                    repo: input.name,
                    ruleset_id: input.ruleset_id,
                    ...(input.ruleset as Record<string, unknown>)
                } as Parameters<Octokit["rest"]["repos"]["updateRepoRuleset"]>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateRepoRulesetSuccess = {
                    success: true,
                    message: "Repository ruleset updated successfully.",
                    http_status: response.status,
                    ruleset: toPlainRuleset(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoRulesetFailure = {
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
