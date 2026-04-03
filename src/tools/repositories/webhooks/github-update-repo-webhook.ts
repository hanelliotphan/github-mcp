import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RepoWebhookItem,
    UpdateRepoWebhookFailure,
    UpdateRepoWebhookSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

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
        config: webhookConfigPartialSchema.optional(),
        events: z.array(z.string().min(1)).optional(),
        add_events: z.array(z.string().min(1)).optional(),
        remove_events: z.array(z.string().min(1)).optional(),
        active: z.boolean().optional()
    })
    .passthrough()
    .refine((body) => Object.keys(body).length > 0, {
        message:
            "webhook must include at least one property to update (GitHub expects a non-empty JSON body). " +
            "If a secret was previously set, resend the same secret or a new one or GitHub removes it."
    });

function toPlainWebhook(data: unknown): RepoWebhookItem {
    return JSON.parse(JSON.stringify(data)) as RepoWebhookItem;
}

export function registerGithubUpdateRepoWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_webhook",
        "Update a repository webhook (PATCH /repos/{owner}/{repo}/hooks/{hook_id}). " +
            "Pass **`webhook`** with one or more of **`config`**, **`events`** (replaces the full list), **`add_events`**, **`remove_events`**, **`active`**; extra keys are forwarded. " +
            "If a **`secret`** was previously set, you must send the same secret, a new secret, or GitHub clears it. " +
            "For **`config`**-only edits, GitHub also offers a dedicated config endpoint. " +
            "Use **`hook_id`** from `github_list_repo_webhooks`. Requires **`write:repo_hook`** or **`repo`** (classic). " +
            "Success is HTTP **200**. " +
            "See [Update a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#update-a-repository-webhook).",
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
            webhook: webhookUpdateBodySchema.describe(
                "Fields to patch: config, events, add_events, remove_events, active (at least one required)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateWebhook({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id,
                    ...(input.webhook as Record<string, unknown>)
                } as Parameters<Octokit["rest"]["repos"]["updateWebhook"]>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateRepoWebhookSuccess = {
                    success: true,
                    message: "Repository webhook updated successfully.",
                    http_status: response.status,
                    hook_id: input.hook_id,
                    webhook: toPlainWebhook(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoWebhookFailure = {
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
