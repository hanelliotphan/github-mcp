import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { PingOrgWebhookFailure, PingOrgWebhookSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubPingOrgWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_ping_org_webhook",
        "Ping an organization webhook (POST /orgs/{org}/hooks/{hook_id}/pings). " +
            "Triggers a [`ping` event](https://docs.github.com/webhooks/#ping-event) to be sent to the hook. " +
            "Success is HTTP **204** No Content. " +
            "Use **`hook_id`** from `github_list_org_webhooks` or **`X-GitHub-Hook-ID`** on a delivery. " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "See [Ping an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#ping-an-organization-webhook).",
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
                const response = await octokit.rest.orgs.pingWebhook({
                    org: input.org,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: PingOrgWebhookSuccess = {
                    success: true,
                    message: "Webhook ping sent successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: PingOrgWebhookFailure = {
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
