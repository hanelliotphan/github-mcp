import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgWebhookFailure, GetOrgWebhookSuccess, OrgWebhookItem } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainWebhook(data: unknown): OrgWebhookItem {
    return JSON.parse(JSON.stringify(data)) as OrgWebhookItem;
}

export function registerGithubGetOrgWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_webhook",
        "Get one organization webhook by ID (GET /orgs/{org}/hooks/{hook_id}). " +
            "Use **`hook_id`** from `github_list_org_webhooks` or the **`X-GitHub-Hook-ID`** header on a delivery. " +
            "For only **`config`** (URL, content type, secret, SSL), use **`github_get_org_webhook_config`** when available. " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "See [Get an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#get-an-organization-webhook).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            hook_id: z
                .number()
                .int()
                .positive()
                .describe(
                    "The unique identifier of the hook. You can find this value in the X-GitHub-Hook-ID header of a webhook delivery."
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.getWebhook({
                    org: input.org,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetOrgWebhookSuccess = {
                    success: true,
                    message: "Webhook retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    webhook: toPlainWebhook(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgWebhookFailure = {
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
