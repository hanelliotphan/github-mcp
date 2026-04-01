import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoWebhookFailure,
    CreateRepoWebhookSuccess,
    RepoWebhookItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const webhookConfigSchema = z
    .object({
        url: z.string().min(1),
        content_type: z.enum(["json", "form"]).optional(),
        secret: z.string().optional(),
        insecure_ssl: z.union([z.string(), z.number()]).optional()
    })
    .passthrough();

const webhookCreateBodySchema = z
    .object({
        name: z.literal("web").optional(),
        config: webhookConfigSchema.describe(
            "Delivery URL (required) and optional content_type (json or form), secret, insecure_ssl (0 or 1)."
        ),
        events: z.array(z.string().min(1)).optional(),
        active: z.boolean().optional()
    })
    .passthrough();

function toPlainWebhook(data: unknown): RepoWebhookItem {
    return JSON.parse(JSON.stringify(data)) as RepoWebhookItem;
}

export function registerGithubCreateRepoWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_webhook",
        "Create a repository webhook (POST /repos/{owner}/{repo}/hooks). " +
            "Pass **`webhook`** with **`config.url`** (payload target). **`name`** must be **`web`** when set (GitHub default). " +
            "Optional **`events`** (default **`push`** on GitHub if omitted), **`active`** (default **true**). " +
            "Each hook should use a unique **`config`** unless events do not overlap (per GitHub). " +
            "Requires **`write:repo_hook`** or **`repo`** for classic tokens; fine-grained tokens need **Administration** write access. " +
            "Success is HTTP **201**. " +
            "See [Create a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#create-a-repository-webhook).",
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
            webhook: webhookCreateBodySchema.describe(
                "Body: config (url required), optional name web, events, active; extra keys forwarded when valid."
            )
        },
        async (input) => {
            try {
                const w = input.webhook as Record<string, unknown>;
                const hookName = (w.name as string | undefined) ?? "web";
                const params: Parameters<Octokit["rest"]["repos"]["createWebhook"]>[0] = {
                    owner: input.owner,
                    repo: input.name,
                    name: hookName,
                    config: w.config as {
                        url: string;
                        content_type?: string;
                        secret?: string;
                        insecure_ssl?: string | number;
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
                const response = await octokit.rest.repos.createWebhook(params);
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateRepoWebhookSuccess = {
                    success: true,
                    message: "Repository webhook created successfully.",
                    http_status: response.status,
                    webhook: toPlainWebhook(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoWebhookFailure = {
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
