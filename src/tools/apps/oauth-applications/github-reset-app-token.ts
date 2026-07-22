import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OAuthAuthorizationItem,
    ResetAppTokenFailure,
    ResetAppTokenSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): OAuthAuthorizationItem {
    return JSON.parse(JSON.stringify(data)) as OAuthAuthorizationItem;
}

export function registerGithubResetAppTokenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_reset_app_token",
        "Reset a valid OAuth access token without end-user involvement (PATCH /applications/{client_id}/token). " +
            "Required: **`client_id`**, **`access_token`** (sensitive; not logged). " +
            "Save the returned **`token`** immediately; the previous token is invalidated. " +
            "Typically requires **OAuth/GitHub App client credentials** (basic auth with client id/secret), " +
            "not a normal Bearer personal access token. Invalid tokens return **404**. " +
            "See [Reset a token](https://docs.github.com/en/rest/apps/oauth-applications?apiVersion=2026-03-10#reset-a-token).",
        {
            client_id: z.string().min(1).describe("The client ID of the GitHub app."),
            access_token: z
                .string()
                .min(1)
                .describe("The access token of the OAuth or GitHub application. Sensitive; do not log.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.resetToken({
                    client_id: input.client_id,
                    access_token: input.access_token
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ResetAppTokenSuccess = {
                    success: true,
                    message: "App token reset successfully.",
                    http_status: response.status,
                    client_id: input.client_id,
                    authorization: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ResetAppTokenFailure = {
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
