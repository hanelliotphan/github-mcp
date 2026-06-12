import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgWebhookFailure, DeleteOrgWebhookSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_webhook",
        "Delete an organization webhook (DELETE /orgs/{org}/hooks/{hook_id}). " +
            "Use **`hook_id`** from `github_list_org_webhooks` or the **`X-GitHub-Hook-ID`** header on a delivery. " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "Success is HTTP **204** with no response body. " +
            "See [Delete an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#delete-an-organization-webhook).",
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
                const response = await octokit.rest.orgs.deleteWebhook({
                    org: input.org,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: DeleteOrgWebhookSuccess = {
                    success: true,
                    message: "Organization webhook deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgWebhookFailure = {
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
