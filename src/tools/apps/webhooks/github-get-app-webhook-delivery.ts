import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppWebhookDeliveryItem,
    GetAppWebhookDeliveryFailure,
    GetAppWebhookDeliverySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainDelivery(data: unknown): AppWebhookDeliveryItem {
    return JSON.parse(JSON.stringify(data)) as AppWebhookDeliveryItem;
}

export function registerGithubGetAppWebhookDeliveryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_app_webhook_delivery",
        "Get one GitHub App webhook delivery by ID (GET /app/hook/deliveries/{delivery_id}). " +
            "Returns the full delivery object (including request/response payloads when present). " +
            "Use **`delivery_id`** from `github_list_app_webhook_deliveries` (field **`id`**). " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get a delivery for an app webhook](https://docs.github.com/en/rest/apps/webhooks?apiVersion=2026-03-10#get-a-delivery-for-an-app-webhook).",
        {
            delivery_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.getWebhookDelivery({
                    delivery_id: input.delivery_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetAppWebhookDeliverySuccess = {
                    success: true,
                    message: "App webhook delivery retrieved successfully.",
                    http_status: response.status,
                    delivery_id: input.delivery_id,
                    delivery: toPlainDelivery(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAppWebhookDeliveryFailure = {
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
