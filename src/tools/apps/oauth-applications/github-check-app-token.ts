import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckAppTokenFailure,
    CheckAppTokenSuccess,
    OAuthAuthorizationItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): OAuthAuthorizationItem {
    return JSON.parse(JSON.stringify(data)) as OAuthAuthorizationItem;
}

export function registerGithubCheckAppTokenTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_app_token",
        "Check an OAuth access token without counting as a failed login (POST /applications/{client_id}/token). " +
            "Required: **`client_id`**, **`access_token`** (sensitive; not logged). " +
            "Typically requires **OAuth/GitHub App client credentials** (basic auth with client id/secret), " +
            "not a normal Bearer personal access token. Invalid tokens return **404**. " +
            "See [Check a token](https://docs.github.com/en/rest/apps/oauth-applications?apiVersion=2026-03-10#check-a-token).",
        {
            client_id: z.string().min(1).describe("The client ID of the GitHub app."),
            access_token: z
                .string()
                .min(1)
                .describe("The access token of the OAuth or GitHub application. Sensitive; do not log.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.checkToken({
                    client_id: input.client_id,
                    access_token: input.access_token
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckAppTokenSuccess = {
                    success: true,
                    message: "App token checked successfully.",
                    http_status: response.status,
                    client_id: input.client_id,
                    authorization: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CheckAppTokenFailure = {
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
