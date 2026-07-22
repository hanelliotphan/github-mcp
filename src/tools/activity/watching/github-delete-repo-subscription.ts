import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteRepoSubscriptionFailure,
    DeleteRepoSubscriptionSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubDeleteRepoSubscriptionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_subscription",
        "Delete the authenticated user's subscription to a repository, stopping watching it (DELETE /repos/{owner}/{repo}/subscription). " +
            "Use this only to stop watching; to control notifications without unwatching, set the subscription with `github_set_repo_subscription`. Returns HTTP **204**. " +
            "See [Delete a repository subscription](https://docs.github.com/en/rest/activity/watching?apiVersion=2026-03-10#delete-a-repository-subscription).",
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
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.activity.deleteRepoSubscription({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoSubscriptionSuccess = {
                    success: true,
                    message: "Repository subscription deleted successfully (no longer watching).",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoSubscriptionFailure = {
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
