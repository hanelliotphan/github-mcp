import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgRuleSuiteFailure,
    GetOrgRuleSuiteSuccess,
    OrgRuleSuiteItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainRuleSuite(data: unknown): OrgRuleSuiteItem {
    return JSON.parse(JSON.stringify(data)) as OrgRuleSuiteItem;
}

export function registerGithubGetOrgRuleSuiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_rule_suite",
        "Get one **organization rule suite** — a suite of rule evaluations at the org level (GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}). " +
            "Returns the rule suite object (`id`, `actor_name`, `ref`, `repository_name`, `pushed_at`, `result`, `evaluation_result`, `rule_evaluations`, …). " +
            "Use **`github_list_org_rule_suites`** to obtain **`rule_suite_id`**. " +
            "**200** on success; **404**, **500** on errors. " +
            "See [Get an organization rule suite](https://docs.github.com/en/rest/orgs/rule-suites?apiVersion=2026-03-10#get-an-organization-rule-suite).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            rule_suite_id: z
                .number()
                .int()
                .positive()
                .describe("The unique identifier of the rule suite result.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}",
                    {
                        org: input.org,
                        rule_suite_id: input.rule_suite_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgRuleSuiteSuccess = {
                    success: true,
                    message: "Organization rule suite retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    rule_suite_id: input.rule_suite_id,
                    rule_suite: toPlainRuleSuite(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgRuleSuiteFailure = {
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
