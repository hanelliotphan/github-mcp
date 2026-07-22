import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetThreadFailure,
    GetThreadSuccess,
    NotificationThreadItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): NotificationThreadItem {
    return JSON.parse(JSON.stringify(data)) as NotificationThreadItem;
}

export function registerGithubGetThreadTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_thread",
        "Get information about a notification thread (GET /notifications/threads/{thread_id}). " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. **`thread_id`** is the `id` returned when listing notifications. Returns HTTP **200**. " +
            "See [Get a thread](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#get-a-thread).",
        {
            thread_id: z.number().int().positive().describe("The unique identifier of the notification thread.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.activity.getThread({
                    thread_id: input.thread_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetThreadSuccess = {
                    success: true,
                    message: "Notification thread retrieved successfully.",
                    http_status: response.status,
                    thread_id: input.thread_id,
                    thread: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetThreadFailure = {
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
