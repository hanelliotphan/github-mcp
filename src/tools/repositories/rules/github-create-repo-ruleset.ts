import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoRulesetFailure,
    CreateRepoRulesetSuccess,
    RepoRulesetListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const rulesetBodySchema = z
    .object({
        name: z.string().min(1),
        enforcement: z.enum(["disabled", "active", "evaluate"]),
        target: z.enum(["branch", "tag", "push"]).optional(),
        bypass_actors: z.array(z.record(z.string(), z.unknown())).optional(),
        conditions: z.record(z.string(), z.unknown()).optional(),
        rules: z.array(z.record(z.string(), z.unknown())).optional()
    })
    .passthrough();

function toPlainRuleset(data: unknown): RepoRulesetListItem {
    return JSON.parse(JSON.stringify(data)) as RepoRulesetListItem;
}

export function registerGithubCreateRepoRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_ruleset",
        "Create a repository ruleset (POST /repos/{owner}/{repo}/rulesets). " +
            "Pass **`ruleset`** with at least **`name`** and **`enforcement`** (`disabled`, `active`, or `evaluate`). " +
            "Optional **`target`** defaults to `branch` on GitHub. Include **`conditions`**, **`rules`**, and **`bypass_actors`** per [GitHub REST docs](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#create-a-repository-ruleset). " +
            "Extra keys on **`ruleset`** are forwarded for API compatibility. " +
            "Requires admin/write access to repository rules. Success is HTTP **201**. " +
            "`bypass_actors` in the response is only returned when the token can read it.",
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
            ruleset: rulesetBodySchema.describe(
                "Ruleset body: name, enforcement; optional target, bypass_actors, conditions, rules (see GitHub API)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createRepoRuleset({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.ruleset as Record<string, unknown>)
                } as Parameters<Octokit["rest"]["repos"]["createRepoRuleset"]>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateRepoRulesetSuccess = {
                    success: true,
                    message: "Repository ruleset created successfully.",
                    http_status: response.status,
                    ruleset: toPlainRuleset(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoRulesetFailure = {
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
