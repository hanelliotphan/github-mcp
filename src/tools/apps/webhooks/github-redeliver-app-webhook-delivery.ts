import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RedeliverAppWebhookDeliveryFailure,
    RedeliverAppWebhookDeliverySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubRedeliverAppWebhookDeliveryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_redeliver_app_webhook_delivery",
        "Redeliver a GitHub App webhook delivery (POST /app/hook/deliveries/{delivery_id}/attempts). " +
            "Queues a new delivery attempt for an existing delivery. Success is typically HTTP **202** Accepted. " +
            "Use **`delivery_id`** from `github_list_app_webhook_deliveries` or `github_get_app_webhook_delivery`. " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Redeliver a delivery for an app webhook](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#redeliver-a-delivery-for-an-app-webhook).",
        {
            delivery_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.redeliverWebhookDelivery({
                    delivery_id: input.delivery_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: RedeliverAppWebhookDeliverySuccess = {
                    success: true,
                    message: "App webhook delivery redelivery queued successfully.",
                    http_status: response.status,
                    delivery_id: input.delivery_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RedeliverAppWebhookDeliveryFailure = {
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
