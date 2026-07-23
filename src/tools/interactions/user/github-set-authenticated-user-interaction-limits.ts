import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetAuthenticatedUserInteractionLimitsFailure,
    SetAuthenticatedUserInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const interactionLimitSchema = z.enum(["existing_users", "contributors_only", "collaborators_only"]);
const interactionExpirySchema = z.enum(["one_day", "three_days", "one_week", "one_month", "six_months"]);

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubSetAuthenticatedUserInteractionLimitsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_authenticated_user_interaction_limits",
        "Set interaction restrictions for the authenticated user's public repositories (PUT /user/interaction-limits). " +
            "See [Set interaction restrictions for your public repositories](https://docs.github.com/en/rest/interactions/user?apiVersion=2026-03-10#set-interaction-restrictions-for-your-public-repositories).",
        {
            limit: interactionLimitSchema.describe(
                "Type of GitHub user allowed to interact while the restriction is active."
            ),
            expiry: interactionExpirySchema
                .optional()
                .describe("Duration of the restriction. Default: one_day.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.interactions.setRestrictionsForAuthenticatedUser({
                    limit: input.limit,
                    expiry: input.expiry
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetAuthenticatedUserInteractionLimitsSuccess = {
                    success: true,
                    message: "Authenticated user interaction limits set successfully.",
                    http_status: response.status as number,
                    interaction_limits: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetAuthenticatedUserInteractionLimitsFailure = {
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
