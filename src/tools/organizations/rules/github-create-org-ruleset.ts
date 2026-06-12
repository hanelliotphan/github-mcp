import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgRulesetFailure,
    CreateOrgRulesetSuccess,
    OrgRulesetListItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const orgRulesetBodySchema = z
    .object({
        name: z.string().min(1),
        enforcement: z.enum(["disabled", "active", "evaluate"]),
        target: z.enum(["branch", "tag", "push", "repository"]).optional(),
        bypass_actors: z.array(z.record(z.string(), z.unknown())).optional(),
        conditions: z.record(z.string(), z.unknown()).optional(),
        rules: z.array(z.record(z.string(), z.unknown())).optional()
    })
    .passthrough();

function toPlainRuleset(data: unknown): OrgRulesetListItem {
    return JSON.parse(JSON.stringify(data)) as OrgRulesetListItem;
}

export function registerGithubCreateOrgRulesetTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_ruleset",
        "Create an **organization repository ruleset** (POST /orgs/{org}/rulesets). " +
            "Pass **`ruleset`** with at least **`name`** and **`enforcement`** (`disabled`, `active`, or `evaluate`). " +
            "Optional **`target`** defaults to `branch` on GitHub (`branch`, `tag`, `push`, or `repository`). " +
            "Include **`conditions`** (org ruleset conditions: `repository_name_and_ref_name`, `repository_id_and_ref_name`, or `repository_property_and_ref_name`), **`rules`**, and **`bypass_actors`** per [GitHub REST docs](https://docs.github.com/en/rest/orgs/rules?apiVersion=2026-03-10#create-an-organization-repository-ruleset). " +
            "Extra keys on **`ruleset`** are forwarded for API compatibility. " +
            "Success is HTTP **201**. `bypass_actors` in the response is only returned when the token can read it.",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            ruleset: orgRulesetBodySchema.describe(
                "Ruleset body: name, enforcement; optional target, bypass_actors, conditions, rules (see GitHub API)."
            )
        },
        async (input) => {
            try {
                const { name, enforcement, ...rulesetRest } = input.ruleset;
                const response = await octokit.request(
                    "POST /orgs/{org}/rulesets",
                    {
                        org: input.org,
                        name,
                        enforcement,
                        ...rulesetRest
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgRulesetSuccess = {
                    success: true,
                    message: "Organization ruleset created successfully.",
                    http_status: response.status,
                    org: input.org,
                    ruleset: toPlainRuleset(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgRulesetFailure = {
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
