import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoWebhookFailure, GetRepoWebhookSuccess, RepoWebhookItem } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainWebhook(data: unknown): RepoWebhookItem {
    return JSON.parse(JSON.stringify(data)) as RepoWebhookItem;
}

export function registerGithubGetRepoWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_webhook",
        "Get one repository webhook by ID (GET /repos/{owner}/{repo}/hooks/{hook_id}). " +
            "Use **`hook_id`** from `github_list_repo_webhooks` or the **`X-GitHub-Hook-ID`** header on a delivery. " +
            "For only **`config`** fields, use the config sub-endpoint in GitHub’s docs. " +
            "Requires **`read:repo_hook`** or **`repo`** for classic tokens. " +
            "See [Get a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#get-a-repository-webhook).",
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
            hook_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getWebhook({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetRepoWebhookSuccess = {
                    success: true,
                    message: "Webhook retrieved successfully.",
                    http_status: response.status,
                    hook_id: input.hook_id,
                    webhook: toPlainWebhook(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoWebhookFailure = {
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
