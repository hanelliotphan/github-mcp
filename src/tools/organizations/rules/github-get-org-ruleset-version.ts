import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgRulesetVersionFailure,
    GetOrgRulesetVersionSuccess,
    OrgRulesetVersionWithState
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainVersion(data: unknown): OrgRulesetVersionWithState {
    return JSON.parse(JSON.stringify(data)) as OrgRulesetVersionWithState;
}

export function registerGithubGetOrgRulesetVersionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_ruleset_version",
        "Get one historical snapshot of an **organization ruleset** (GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id}). " +
            "The response includes version metadata (`version_id`, `actor`, `updated_at`) and **`state`** (the ruleset definition at that version). " +
            "Use **`version_id`** from **`github_get_org_ruleset_history`**. " +
            "**200** on success; **404**, **500** on errors. " +
            "See [Get organization ruleset version](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#get-organization-ruleset-version).",
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
                .describe("The ID of the ruleset."),
            version_id: z
                .number()
                .int()
                .positive()
                .describe("The ID of the version.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.getOrgRulesetVersion({
                    org: input.org,
                    ruleset_id: input.ruleset_id,
                    version_id: input.version_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgRulesetVersionSuccess = {
                    success: true,
                    message: "Organization ruleset version retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    ruleset_id: input.ruleset_id,
                    version_id: input.version_id,
                    version: toPlainVersion(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgRulesetVersionFailure = {
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
