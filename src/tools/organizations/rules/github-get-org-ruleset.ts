import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgRulesetFailure,
    GetOrgRulesetSuccess,
    OrgRulesetListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainRuleset(data: unknown): OrgRulesetListItem {
    return JSON.parse(JSON.stringify(data)) as OrgRulesetListItem;
}

export function registerGithubGetOrgRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_ruleset",
        "Get one **organization repository ruleset** by ID (GET /orgs/{org}/rulesets/{ruleset_id}). " +
            "Use **`ruleset_id`** from **`github_list_org_rulesets`**. " +
            "`bypass_actors` is only returned when the token has **write** access to the ruleset. " +
            "**200** on success; **404**, **500** on errors. " +
            "See [Get an organization repository ruleset](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#get-an-organization-repository-ruleset).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            ruleset_id: z
                .number()
                .int()
                .positive()
                .describe("The ID of the ruleset.")
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /orgs/{org}/rulesets/{ruleset_id}", {
                    org: input.org,
                    ruleset_id: input.ruleset_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgRulesetSuccess = {
                    success: true,
                    message: "Organization ruleset retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    ruleset_id: input.ruleset_id,
                    ruleset: toPlainRuleset(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgRulesetFailure = {
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
