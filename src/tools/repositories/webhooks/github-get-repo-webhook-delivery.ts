import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoWebhookDeliveryFailure,
    GetRepoWebhookDeliverySuccess,
    RepoWebhookDeliveryItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainDelivery(data: unknown): RepoWebhookDeliveryItem {
    return JSON.parse(JSON.stringify(data)) as RepoWebhookDeliveryItem;
}

export function registerGithubGetRepoWebhookDeliveryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_webhook_delivery",
        "Get one webhook delivery by ID (GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}). " +
            "Returns the full delivery object (including request/response payloads when present). " +
            "Use **`delivery_id`** from `github_list_repo_webhook_deliveries` (field **`id`**). " +
            "Requires **`read:repo_hook`** or **`repo`** for classic tokens. " +
            "See [Get a delivery for a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#get-a-delivery-for-a-repository-webhook).",
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
                const response = await octokit.rest.repos.getWebhookDelivery({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetRepoWebhookDeliverySuccess = {
                    success: true,
                    message: "Webhook delivery retrieved successfully.",
                    http_status: response.status,
                    hook_id: input.hook_id,
                    delivery_id: input.delivery_id,
                    delivery: toPlainDelivery(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoWebhookDeliveryFailure = {
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
