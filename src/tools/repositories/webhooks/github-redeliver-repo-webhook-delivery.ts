import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RedeliverRepoWebhookDeliveryFailure, RedeliverRepoWebhookDeliverySuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRedeliverRepoWebhookDeliveryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_redeliver_repo_webhook_delivery",
        "Redeliver a webhook delivery (POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts). " +
            "Queues a new delivery attempt for an existing delivery. Success is typically HTTP **202** Accepted. " +
            "Use **`delivery_id`** from `github_list_repo_webhook_deliveries` or `github_get_repo_webhook_delivery`. " +
            "Requires **`write:repo_hook`** or **`repo`** for classic tokens. " +
            "See [Redeliver a delivery for a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#redeliver-a-delivery-for-a-repository-webhook).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            hook_id: z.number().int().positive(),
            delivery_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.redeliverWebhookDelivery({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: RedeliverRepoWebhookDeliverySuccess = {
                    success: true,
                    message: "Webhook delivery redelivery queued successfully.",
                    http_status: response.status,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RedeliverRepoWebhookDeliveryFailure = {
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
