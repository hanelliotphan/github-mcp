import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetThreadSubscriptionFailure,
    SetThreadSubscriptionSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubSetThreadSubscriptionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_thread_subscription",
        "Set the authenticated user's subscription to a notification thread (PUT /notifications/threads/{thread_id}/subscription). " +
            "Set **`ignored`** to `true` to block all future notifications from the thread, or `false` to (re)subscribe. " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Returns HTTP **200**. " +
            "See [Set a thread subscription](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#set-a-thread-subscription).",
        {
            thread_id: z.number().int().positive().describe("The unique identifier of the notification thread."),
            ignored: z.boolean().optional().describe("Whether to block all notifications from the thread (default false).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.activity.setThreadSubscription({
                    thread_id: input.thread_id,
                    ...(input.ignored !== undefined ? { ignored: input.ignored } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetThreadSubscriptionSuccess = {
                    success: true,
                    message: "Thread subscription set successfully.",
                    http_status: response.status,
                    thread_id: input.thread_id,
                    subscription: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetThreadSubscriptionFailure = {
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
