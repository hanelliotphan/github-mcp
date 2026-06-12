import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgWebhookFailure,
    CreateOrgWebhookSuccess,
    OrgWebhookItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const webhookConfigSchema = z
    .object({
        url: z.string().min(1),
        content_type: z.enum(["json", "form"]).optional(),
        secret: z.string().optional(),
        insecure_ssl: z.union([z.string(), z.number()]).optional(),
        username: z.string().optional(),
        password: z.string().optional()
    })
    .passthrough();

const webhookCreateBodySchema = z
    .object({
        name: z.literal("web").optional(),
        config: webhookConfigSchema.describe(
            "Delivery URL (required) and optional content_type (json or form), secret, insecure_ssl (0 or 1), username, password."
        ),
        events: z.array(z.string().min(1)).optional(),
        active: z.boolean().optional()
    })
    .passthrough();

function toPlainWebhook(data: unknown): OrgWebhookItem {
    return JSON.parse(JSON.stringify(data)) as OrgWebhookItem;
}

export function registerGithubCreateOrgWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_webhook",
        "Create an organization webhook (POST /orgs/{org}/hooks). " +
            "Creates a hook that posts payloads in JSON format when **`config.content_type`** is **`json`**. " +
            "Pass **`webhook`** with **`config.url`** (payload target). **`name`** must be **`web`** when set (GitHub default). " +
            "Optional **`events`** (default **`push`** on GitHub if omitted), **`active`** (default **true**). " +
            "Optional **`config`**: **`content_type`**, **`secret`**, **`insecure_ssl`**, **`username`**, **`password`**. " +
            "The authenticated user must be an **organization owner**; classic OAuth apps and PATs need **`admin:org_hook`** scope. " +
            "Success is HTTP **201**. " +
            "See [Create an organization webhook](https://docs.github.com/en/rest/orgs/webhooks?apiVersion=2026-03-10#create-an-organization-webhook).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            webhook: webhookCreateBodySchema.describe(
                "Body: config (url required), optional name web, events, active; extra keys forwarded when valid."
            )
        },
        async (input) => {
            try {
                const w = input.webhook as Record<string, unknown>;
                const hookName = (w.name as string | undefined) ?? "web";
                const params: Parameters<Octokit["rest"]["orgs"]["createWebhook"]>[0] = {
                    org: input.org,
                    name: hookName,
                    config: w.config as {
                        url: string;
                        content_type?: string;
                        secret?: string;
                        insecure_ssl?: string | number;
                        username?: string;
                        password?: string;
                    }
                };
                if (w.events !== undefined) {
                    params.events = w.events as string[];
                }
                if (w.active !== undefined) {
                    params.active = w.active as boolean;
                }
                for (const [key, value] of Object.entries(w)) {
                    if (!["name", "config", "events", "active"].includes(key)) {
                        (params as Record<string, unknown>)[key] = value;
                    }
                }
                const response = await octokit.rest.orgs.createWebhook(params);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateOrgWebhookSuccess = {
                    success: true,
                    message: "Organization webhook created successfully.",
                    http_status: response.status,
                    org: input.org,
                    webhook: toPlainWebhook(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgWebhookFailure = {
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
