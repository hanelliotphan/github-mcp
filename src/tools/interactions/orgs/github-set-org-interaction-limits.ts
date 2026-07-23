import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetOrgInteractionLimitsFailure,
    SetOrgInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const interactionLimitSchema = z.enum(["existing_users", "contributors_only", "collaborators_only"]);
const interactionExpirySchema = z.enum(["one_day", "three_days", "one_week", "one_month", "six_months"]);

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetOrgInteractionLimitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_interaction_limits",
        "Set interaction restrictions for an organization (PUT /orgs/{org}/interaction-limits). " +
            "Requires organization owner access. Overwrites repository-level limits for org-owned public repos. " +
            "See [Set interaction restrictions for an organization](https://docs.github.com/en/rest/interactions/orgs?apiVersion=2026-03-10#set-interaction-restrictions-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            limit: interactionLimitSchema.describe(
                "Type of GitHub user allowed to interact while the restriction is active."
            ),
            expiry: interactionExpirySchema
                .optional()
                .describe("Duration of the restriction. Default: one_day.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.interactions.setRestrictionsForOrg({
                    org: input.org,
                    limit: input.limit,
                    expiry: input.expiry
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetOrgInteractionLimitsSuccess = {
                    success: true,
                    message: "Organization interaction limits set successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    interaction_limits: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgInteractionLimitsFailure = {
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
