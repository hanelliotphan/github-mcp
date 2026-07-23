import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgInteractionLimitsFailure,
    GetOrgInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function parseInteractionLimits(data: unknown): Record<string, unknown> | null {
    if (data === null || data === undefined) {
        return null;
    }
    if (typeof data === "object" && !Array.isArray(data) && Object.keys(data as object).length === 0) {
        return null;
    }
    return toPlain(data);
}

export function registerGithubGetOrgInteractionLimitsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_interaction_limits",
        "Get interaction restrictions for an organization (GET /orgs/{org}/interaction-limits). " +
            "When no restrictions are active, GitHub may return an empty object; the tool returns **`interaction_limits`: null** with a clear message. " +
            "See [Get interaction restrictions for an organization](https://docs.github.com/en/rest/interactions/orgs?apiVersion=2026-03-10#get-interaction-restrictions-for-an-organization).",
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
                const response = await octokit.rest.interactions.getRestrictionsForOrg({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const interactionLimits = parseInteractionLimits(response.data);
                const successPayload: GetOrgInteractionLimitsSuccess = {
                    success: true,
                    message: interactionLimits
                        ? "Organization interaction limits retrieved successfully."
                        : "No interaction restrictions are currently set for this organization.",
                    http_status: response.status as number,
                    org: input.org,
                    interaction_limits: interactionLimits,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgInteractionLimitsFailure = {
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
