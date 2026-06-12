import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgRulesetFailure, DeleteOrgRulesetSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_ruleset",
        "Delete an **organization repository ruleset** (DELETE /orgs/{org}/rulesets/{ruleset_id}). " +
            "Use **`ruleset_id`** from **`github_list_org_rulesets`** or **`github_get_org_ruleset`**. " +
            "Success is HTTP **204** No Content. **404**, **500** on errors. " +
            "See [Delete an organization repository ruleset](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#delete-an-organization-repository-ruleset).",
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
                const response = await octokit.request("DELETE /orgs/{org}/rulesets/{ruleset_id}", {
                    org: input.org,
                    ruleset_id: input.ruleset_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgRulesetSuccess = {
                    success: true,
                    message: "Organization ruleset deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    ruleset_id: input.ruleset_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgRulesetFailure = {
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
