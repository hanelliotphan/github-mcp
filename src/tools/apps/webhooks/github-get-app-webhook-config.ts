import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    AppWebhookConfigItem,
    GetAppWebhookConfigFailure,
    GetAppWebhookConfigSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainConfig(data: unknown): AppWebhookConfigItem {
    return JSON.parse(JSON.stringify(data)) as AppWebhookConfigItem;
}

export function registerGithubGetAppWebhookConfigTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_app_webhook_config",
        "Get the webhook configuration for a GitHub App (GET /app/hook/config). " +
            "Returns **`url`**, **`content_type`**, **`secret`**, **`insecure_ssl`**. " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get a webhook configuration for an app](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#get-a-webhook-configuration-for-an-app).",
        {},
        async () => {
            try {
                const response = await octokit.rest.apps.getWebhookConfigForApp();
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetAppWebhookConfigSuccess = {
                    success: true,
                    message: "App webhook configuration retrieved successfully.",
                    http_status: response.status,
                    config: toPlainConfig(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAppWebhookConfigFailure = {
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
