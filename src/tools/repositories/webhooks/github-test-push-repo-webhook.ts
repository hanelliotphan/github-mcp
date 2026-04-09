import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { TestPushRepoWebhookFailure, TestPushRepoWebhookSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubTestPushRepoWebhookTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_test_push_repo_webhook",
        "Test the push repository webhook (POST /repos/{owner}/{repo}/hooks/{hook_id}/tests). " +
            "If the hook is subscribed to **`push`**, GitHub sends a test delivery using the latest push; " +
            "if not subscribed to **`push`**, the API still returns **204** but no POST is sent to the URL. " +
            "Success is HTTP **204** No Content. " +
            "Use **`hook_id`** from `github_list_repo_webhooks`. " +
            "Requires **`write:repo_hook`** or **`repo`** for classic tokens. " +
            "See [Test the push repository webhook](https://docs.github.com/en/rest/repos/webhooks?apiVersion=2026-03-10#test-the-push-repository-webhook).",
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
                const response = await octokit.rest.repos.testPushWebhook({
                    owner: input.owner,
                    repo: input.name,
                    hook_id: input.hook_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: TestPushRepoWebhookSuccess = {
                    success: true,
                    message: "Push webhook test completed successfully.",
                    http_status: response.status,
                    hook_id: input.hook_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: TestPushRepoWebhookFailure = {
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
