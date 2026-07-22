import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetRepoSubscriptionFailure,
    SetRepoSubscriptionSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubSetRepoSubscriptionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_repo_subscription",
        "Set the authenticated user's subscription to a repository (PUT /repos/{owner}/{repo}/subscription). " +
            "Set **`subscribed`** to `true` to watch the repository, or **`ignored`** to `true` to block all notifications from it. " +
            "To stop watching entirely, delete the subscription with `github_delete_repo_subscription` instead. Returns HTTP **200**. " +
            "See [Set a repository subscription](https://docs.github.com/en/rest/activity/watching?apiVersion=2026-03-10#set-a-repository-subscription).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            subscribed: z.boolean().optional().describe("Whether notifications should be received from this repository."),
            ignored: z.boolean().optional().describe("Whether all notifications should be blocked from this repository.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.activity.setRepoSubscription({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.subscribed !== undefined ? { subscribed: input.subscribed } : {}),
                    ...(input.ignored !== undefined ? { ignored: input.ignored } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetRepoSubscriptionSuccess = {
                    success: true,
                    message: "Repository subscription set successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    subscription: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetRepoSubscriptionFailure = {
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
