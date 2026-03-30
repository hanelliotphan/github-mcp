import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoRuleSuiteFailure,
    GetRepoRuleSuiteSuccess,
    RepoRuleEvaluationItem,
    RepoRuleSuiteDetail
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function normalizeRuleEvaluation(ev: {
    rule_source?: {
        type?: string;
        id?: number | null;
        name?: string | null;
    };
    enforcement?: "active" | "evaluate" | "deleted ruleset";
    result?: "pass" | "fail";
    rule_type?: string;
    details?: string | null;
}): RepoRuleEvaluationItem {
    return {
        rule_source:
            ev.rule_source != null
                ? {
                      type: ev.rule_source.type,
                      id: ev.rule_source.id ?? null,
                      name: ev.rule_source.name ?? null
                  }
                : undefined,
        enforcement: ev.enforcement,
        result: ev.result,
        rule_type: ev.rule_type,
        details: ev.details ?? null
    };
}

function normalizeRuleSuiteDetail(data: {
    id?: number;
    actor_id?: number | null;
    actor_name?: string | null;
    before_sha?: string;
    after_sha?: string;
    ref?: string;
    repository_id?: number;
    repository_name?: string;
    pushed_at?: string;
    result?: "pass" | "fail" | "bypass";
    evaluation_result?: "pass" | "fail" | "bypass" | null;
    rule_evaluations?: {
        rule_source?: {
            type?: string;
            id?: number | null;
            name?: string | null;
        };
        enforcement?: "active" | "evaluate" | "deleted ruleset";
        result?: "pass" | "fail";
        rule_type?: string;
        details?: string | null;
    }[];
}): RepoRuleSuiteDetail {
    return {
        id: data.id ?? 0,
        actor_id: data.actor_id,
        actor_name: data.actor_name,
        before_sha: data.before_sha,
        after_sha: data.after_sha,
        ref: data.ref,
        repository_id: data.repository_id,
        repository_name: data.repository_name,
        pushed_at: data.pushed_at,
        result: data.result,
        evaluation_result: data.evaluation_result,
        rule_evaluations: (data.rule_evaluations ?? []).map(normalizeRuleEvaluation)
    };
}

export function registerGithubGetRepoRuleSuiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_rule_suite",
        "Get one ruleset evaluation suite by ID (GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}). " +
            "Returns summary fields plus **`rule_evaluations`** (per-rule results). " +
            "Use `github_list_repo_rule_suites` to discover IDs. " +
            "Requires access to view ruleset insights for the repository. " +
            "See GitHub REST docs for repository rule suites.",
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
            rule_suite_id: z
                .number()
                .int()
                .positive()
                .describe("Rule suite ID from the list rule suites response (`id` on each row).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getRepoRuleSuite({
                    owner: input.owner,
                    repo: input.name,
                    rule_suite_id: input.rule_suite_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetRepoRuleSuiteSuccess = {
                    success: true,
                    message: "Rule suite retrieved successfully.",
                    rule_suite: normalizeRuleSuiteDetail(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoRuleSuiteFailure = {
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
