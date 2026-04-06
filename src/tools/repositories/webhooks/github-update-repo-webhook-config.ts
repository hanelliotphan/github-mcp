import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RepoWebhookConfigItem,
    UpdateRepoWebhookConfigFailure,
    UpdateRepoWebhookConfigSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const webhookConfigPatchSchema = z
    .object({
        url: z.string().min(1).optional(),
        content_type: z.enum(["json", "form"]).optional(),
        secret: z.string().optional(),
        insecure_ssl: z.union([z.string(), z.number()]).optional()
    })
    .passthrough()
    .refine((body) => Object.keys(body).length > 0, {
        message:
            "config must include at least one property to update (GitHub expects a non-empty JSON body). " +
            "If a secret was previously set, resend the same secret or a new one or GitHub removes it."
    });

function toPlainConfig(data: unknown): RepoWebhookConfigItem {
    return JSON.parse(JSON.stringify(data)) as RepoWebhookConfigItem;
}

export function registerGithubUpdateRepoWebhookConfigTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_webhook_config",
        "Update webhook **configuration** only (PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config). " +
            "Pass **`config`** with one or more of **`url`**, **`content_type`** (`json` or `form`), **`secret`**, **`insecure_ssl`**; extra keys are forwarded. " +
            "Does not change **`events`** or **`active`**—use **`github_update_repo_webhook`** for those. " +
            "Classic tokens need **`write:repo_hook`** or **`repo`**. Success is HTTP **200**. " +
            "See [Update a webhook configuration for a repository](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#update-a-webhook-configuration-for-a-repository).",
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
            config: webhookConfigPatchSchema.describe(
                "At least one of url, content_type, secret, insecure_ssl (same semantics as GitHub config API)."
            )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateWebhookConfigForRepo({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id,
                    ...(input.config as Record<string, unknown>)
                } as Parameters<Octokit["rest"]["repos"]["updateWebhookConfigForRepo"]>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: UpdateRepoWebhookConfigSuccess = {
                    success: true,
                    message: "Webhook configuration updated successfully.",
                    http_status: response.status,
                    hook_id: input.hook_id,
                    config: toPlainConfig(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoWebhookConfigFailure = {
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
