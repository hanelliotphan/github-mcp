import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppWebhookConfigItem,
    UpdateAppWebhookConfigFailure,
    UpdateAppWebhookConfigSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainConfig(data: unknown): AppWebhookConfigItem {
    return JSON.parse(JSON.stringify(data)) as AppWebhookConfigItem;
}

export function registerGithubUpdateAppWebhookConfigTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_app_webhook_config",
        "Update the webhook configuration for a GitHub App (PATCH /app/hook/config). " +
            "Pass one or more of **`url`**, **`content_type`** (`json` or `form`), **`secret`**, **`insecure_ssl`**. " +
            "You must authenticate with a **JWT** (as a GitHub App). Success is HTTP **200**. " +
            "See [Update a webhook configuration for an app](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#update-a-webhook-configuration-for-an-app).",
        {
            url: z.string().min(1).optional(),
            content_type: z.enum(["json", "form"]).optional(),
            secret: z.string().optional(),
            insecure_ssl: z.union([z.string(), z.number()]).optional()
        },
        async (input) => {
            const body: {
                url?: string;
                content_type?: "json" | "form";
                secret?: string;
                insecure_ssl?: string | number;
            } = {};
            if (input.url !== undefined) body.url = input.url;
            if (input.content_type !== undefined) body.content_type = input.content_type;
            if (input.secret !== undefined) body.secret = input.secret;
            if (input.insecure_ssl !== undefined) body.insecure_ssl = input.insecure_ssl;

            if (Object.keys(body).length === 0) {
                const failurePayload: UpdateAppWebhookConfigFailure = {
                    success: false,
                    error: {
                        status_code: 422,
                        error_type: "validation_error",
                        message:
                            "Provide at least one of url, content_type, secret, or insecure_ssl (GitHub expects a non-empty JSON body).",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }

            try {
                const response = await octokit.rest.apps.updateWebhookConfigForApp(body);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateAppWebhookConfigSuccess = {
                    success: true,
                    message: "App webhook configuration updated successfully.",
                    http_status: response.status,
                    config: toPlainConfig(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateAppWebhookConfigFailure = {
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
