import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgRulesetListItem,
    UpdateOrgRulesetFailure,
    UpdateOrgRulesetSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const orgRulesetUpdateBodySchema = z
    .object({
        name: z.string().min(1).optional(),
        enforcement: z.enum(["disabled", "active", "evaluate"]).optional(),
        target: z.enum(["branch", "tag", "push", "repository"]).optional(),
        bypass_actors: z.array(z.record(z.string(), z.unknown())).optional(),
        conditions: z.record(z.string(), z.unknown()).optional(),
        rules: z.array(z.record(z.string(), z.unknown())).optional()
    })
    .passthrough()
    .refine((body) => Object.keys(body).length > 0, {
        message: "ruleset must include at least one property to update (GitHub expects a non-empty JSON body)."
    });

function toPlainRuleset(data: unknown): OrgRulesetListItem {
    return JSON.parse(JSON.stringify(data)) as OrgRulesetListItem;
}

export function registerGithubUpdateOrgRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_ruleset",
        "Update an **organization repository ruleset** (PUT /orgs/{org}/rulesets/{ruleset_id}). " +
            "Pass **`ruleset`** with one or more fields to change (`name`, `enforcement`, `target`, `bypass_actors`, `conditions`, `rules`); extra keys are forwarded. " +
            "Use **`github_list_org_rulesets`** or **`github_get_org_ruleset`** for **`ruleset_id`**. " +
            "Success is HTTP **200**. `bypass_actors` in the response is only returned when the token can read it. " +
            "See [Update an organization repository ruleset](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#update-an-organization-repository-ruleset).",
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
            ruleset: orgRulesetUpdateBodySchema.describe(
                "Fields to set on the ruleset (subset of create body; at least one key required)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/rulesets/{ruleset_id}",
                    {
                        org: input.org,
                        ruleset_id: input.ruleset_id,
                        ...input.ruleset
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgRulesetSuccess = {
                    success: true,
                    message: "Organization ruleset updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    ruleset_id: input.ruleset_id,
                    ruleset: toPlainRuleset(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgRulesetFailure = {
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
