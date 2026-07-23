import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveOrgInteractionLimitsFailure,
    RemoveOrgInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgInteractionLimitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_interaction_limits",
        "Remove interaction restrictions from an organization's public repositories (DELETE /orgs/{org}/interaction-limits). " +
            "Requires organization owner access. Returns HTTP 204 with no body on success. " +
            "See [Remove interaction restrictions for an organization](https://docs.github.com/en/rest/interactions/orgs?apiVersion=2026-03-10#remove-interaction-restrictions-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.interactions.removeRestrictionsForOrg({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgInteractionLimitsSuccess = {
                    success: true,
                    message: "Organization interaction limits removed successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgInteractionLimitsFailure = {
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
