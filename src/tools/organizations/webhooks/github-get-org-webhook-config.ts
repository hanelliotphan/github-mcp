import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgWebhookConfigFailure,
    GetOrgWebhookConfigSuccess,
    OrgWebhookConfigItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainConfig(data: unknown): OrgWebhookConfigItem {
    return JSON.parse(JSON.stringify(data)) as OrgWebhookConfigItem;
}

export function registerGithubGetOrgWebhookConfigTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_webhook_config",
        "Get webhook **configuration** only for an organization (GET /orgs/{org}/hooks/{hook_id}/config). " +
            "Returns **`url`**, **`content_type`**, **`secret`**, **`insecure_ssl`** (not the full hook with `events` / `active`—use `github_get_org_webhook` for that). " +
            "Use **`hook_id`** from `github_list_org_webhooks`. " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "See [Get a webhook configuration for an organization](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#get-a-webhook-configuration-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            hook_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.getWebhookConfigForOrg({
                    org: input.org,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetOrgWebhookConfigSuccess = {
                    success: true,
                    message: "Webhook configuration retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    config: toPlainConfig(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgWebhookConfigFailure = {
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
