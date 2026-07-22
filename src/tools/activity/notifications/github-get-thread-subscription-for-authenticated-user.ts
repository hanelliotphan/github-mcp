import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetThreadSubscriptionForAuthenticatedUserFailure,
    GetThreadSubscriptionForAuthenticatedUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetThreadSubscriptionForAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_thread_subscription_for_authenticated_user",
        "Check whether the authenticated user is subscribed to a notification thread (GET /notifications/threads/{thread_id}/subscription). " +
            "Subscriptions are only generated when a user participates in a conversation (replied, @mentioned, or manually subscribed). " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Returns HTTP **200**. " +
            "See [Get a thread subscription for the authenticated user](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#get-a-thread-subscription-for-the-authenticated-user).",
        {
            thread_id: z.number().int().positive().describe("The unique identifier of the notification thread.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.activity.getThreadSubscriptionForAuthenticatedUser({
                    thread_id: input.thread_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetThreadSubscriptionForAuthenticatedUserSuccess = {
                    success: true,
                    message: "Thread subscription retrieved successfully.",
                    http_status: response.status,
                    thread_id: input.thread_id,
                    subscription: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetThreadSubscriptionForAuthenticatedUserFailure = {
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
