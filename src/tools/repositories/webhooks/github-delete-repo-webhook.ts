import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoWebhookFailure, DeleteRepoWebhookSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteRepoWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_webhook",
        "Delete a repository webhook (DELETE /repos/{owner}/{repo}/hooks/{hook_id}). " +
            "Use **`hook_id`** from `github_list_repo_webhooks` or **`X-GitHub-Hook-ID`** on a delivery. " +
            "Requires repo **owner** or **admin** access. Success is HTTP **204** with no response body. " +
            "See [Delete a repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#delete-a-repository-webhook).",
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
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.repos.deleteWebhook({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: DeleteRepoWebhookSuccess = {
                    success: true,
                    message: "Repository webhook deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    hook_id: input.hook_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoWebhookFailure = {
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
