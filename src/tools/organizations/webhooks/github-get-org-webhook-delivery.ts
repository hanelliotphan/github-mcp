import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgWebhookDeliveryFailure,
    GetOrgWebhookDeliverySuccess,
    OrgWebhookDeliveryItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainDelivery(data: unknown): OrgWebhookDeliveryItem {
    return JSON.parse(JSON.stringify(data)) as OrgWebhookDeliveryItem;
}

export function registerGithubGetOrgWebhookDeliveryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_webhook_delivery",
        "Get one organization webhook delivery by ID (GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}). " +
            "Returns the full delivery object (including request/response payloads when present). " +
            "Use **`delivery_id`** from `github_list_org_webhook_deliveries` (field **`id`**). " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "See [Get a webhook delivery for an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#get-a-webhook-delivery-for-an-organization-webhook).",
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
                const response = await octokit.rest.orgs.getWebhookDelivery({
                    org: input.org,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetOrgWebhookDeliverySuccess = {
                    success: true,
                    message: "Webhook delivery retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id,
                    delivery: toPlainDelivery(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgWebhookDeliveryFailure = {
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
