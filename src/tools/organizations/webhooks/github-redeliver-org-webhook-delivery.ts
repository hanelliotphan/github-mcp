import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RedeliverOrgWebhookDeliveryFailure,
    RedeliverOrgWebhookDeliverySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRedeliverOrgWebhookDeliveryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_redeliver_org_webhook_delivery",
        "Redeliver an organization webhook delivery (POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts). " +
            "Queues a new delivery attempt for an existing delivery. Success is typically HTTP **202** Accepted. " +
            "Use **`delivery_id`** from `github_list_org_webhook_deliveries` or `github_get_org_webhook_delivery`. " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "See [Redeliver a delivery for an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#redeliver-a-delivery-for-an-organization-webhook).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            hook_id: z.number().int().positive(),
            delivery_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.redeliverWebhookDelivery({
                    org: input.org,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: RedeliverOrgWebhookDeliverySuccess = {
                    success: true,
                    message: "Webhook delivery redelivery queued successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RedeliverOrgWebhookDeliveryFailure = {
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
