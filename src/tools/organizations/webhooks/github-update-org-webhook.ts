import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgWebhookItem,
    UpdateOrgWebhookFailure,
    UpdateOrgWebhookSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const webhookConfigPartialSchema = z
    .object({
        url: z.string().min(1).optional(),
        content_type: z.enum(["json", "form"]).optional(),
        secret: z.string().optional(),
        insecure_ssl: z.union([z.string(), z.number()]).optional()
    })
    .passthrough();

const webhookUpdateBodySchema = z
    .object({
        name: z.string().optional(),
        config: webhookConfigPartialSchema.optional(),
        events: z.array(z.string().min(1)).optional(),
        active: z.boolean().optional()
    })
    .passthrough()
    .refine((body) => Object.keys(body).length > 0, {
        message:
            "webhook must include at least one property to update (GitHub expects a non-empty JSON body). " +
            "If a secret was previously set, resend the same secret or set a new secret or GitHub removes it."
    });

function toPlainWebhook(data: unknown): OrgWebhookItem {
    return JSON.parse(JSON.stringify(data)) as OrgWebhookItem;
}

export function registerGithubUpdateOrgWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_webhook",
        "Update an organization webhook (PATCH /orgs/{org}/hooks/{hook_id}). " +
            "Pass **`webhook`** with one or more of **`config`**, **`events`**, **`active`**, **`name`**; extra keys are forwarded. " +
            "If a **`secret`** was previously set, you must send the same secret, a new secret, or GitHub clears it. " +
            "For **`config`**-only edits, use **`github_update_org_webhook_config`** when available. " +
            "Use **`hook_id`** from `github_list_org_webhooks`. The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "Success is HTTP **200**. " +
            "See [Update an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#update-an-organization-webhook).",
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
            webhook: webhookUpdateBodySchema.describe(
                "Fields to patch: name, config, events, active (at least one required)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.updateWebhook({
                    org: input.org,
                    hook_id: input.hook_id,
                    ...(input.webhook as Record<string, unknown>)
                } as Parameters<Octokit["rest"]["orgs"]["updateWebhook"]>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateOrgWebhookSuccess = {
                    success: true,
                    message: "Organization webhook updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    hook_id: input.hook_id,
                    webhook: toPlainWebhook(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgWebhookFailure = {
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
