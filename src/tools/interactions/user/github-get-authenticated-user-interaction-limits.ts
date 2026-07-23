import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    GetAuthenticatedUserInteractionLimitsFailure,
    GetAuthenticatedUserInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

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

export function registerGithubGetAuthenticatedUserInteractionLimitsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_authenticated_user_interaction_limits",
        "Get interaction restrictions for the authenticated user's public repositories (GET /user/interaction-limits). " +
            "HTTP **204** means no restrictions are set; the tool returns **`interaction_limits`: null** with **`http_status`: 204**. " +
            "See [Get interaction restrictions for your public repositories](https://docs.github.com/en/rest/interactions/user?apiVersion=2026-03-10#get-interaction-restrictions-for-your-public-repositories).",
        {},
        async () => {
            try {
                const response = await octokit.rest.interactions.getRestrictionsForAuthenticatedUser();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const httpStatus = response.status as number;
                const interactionLimits =
                    httpStatus === 204 ? null : parseInteractionLimits(response.data);
                const successPayload: GetAuthenticatedUserInteractionLimitsSuccess = {
                    success: true,
                    message:
                        httpStatus === 204 || interactionLimits === null
                            ? "No interaction restrictions are currently set for your public repositories."
                            : "Authenticated user interaction limits retrieved successfully.",
                    http_status: httpStatus,
                    interaction_limits: interactionLimits,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedUserInteractionLimitsFailure = {
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
