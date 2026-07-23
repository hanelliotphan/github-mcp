import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    RemoveAuthenticatedUserInteractionLimitsFailure,
    RemoveAuthenticatedUserInteractionLimitsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubRemoveAuthenticatedUserInteractionLimitsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_remove_authenticated_user_interaction_limits",
        "Remove interaction restrictions from the authenticated user's public repositories (DELETE /user/interaction-limits). " +
            "Returns HTTP 204 with no body on success. " +
            "See [Remove interaction restrictions from your public repositories](https://docs.github.com/en/rest/interactions/user?apiVersion=2026-03-10#remove-interaction-restrictions-from-your-public-repositories).",
        {},
        async () => {
            try {
                const response = await octokit.rest.interactions.removeRestrictionsForAuthenticatedUser();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveAuthenticatedUserInteractionLimitsSuccess = {
                    success: true,
                    message: "Authenticated user interaction limits removed successfully.",
                    http_status: response.status as number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveAuthenticatedUserInteractionLimitsFailure = {
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
