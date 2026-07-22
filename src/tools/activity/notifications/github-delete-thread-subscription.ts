import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteThreadSubscriptionFailure,
    DeleteThreadSubscriptionSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteThreadSubscriptionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_thread_subscription",
        "Delete the authenticated user's subscription to a notification thread (DELETE /notifications/threads/{thread_id}/subscription). " +
            "Mutes all future notifications for the conversation until you comment or get an @mention. If you watch the thread's repository you will still receive notifications; " +
            "to ignore those, use `github_set_thread_subscription` with `ignored: true` instead. " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Returns HTTP **204**. " +
            "See [Delete a thread subscription](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#delete-a-thread-subscription).",
        {
            thread_id: z.number().int().positive().describe("The unique identifier of the notification thread.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.activity.deleteThreadSubscription({
                    thread_id: input.thread_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteThreadSubscriptionSuccess = {
                    success: true,
                    message: "Thread subscription deleted successfully.",
                    http_status: response.status,
                    thread_id: input.thread_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteThreadSubscriptionFailure = {
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
