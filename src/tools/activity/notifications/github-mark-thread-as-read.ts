import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    MarkThreadAsReadFailure,
    MarkThreadAsReadSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubMarkThreadAsReadTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_mark_thread_as_read",
        "Mark a notification thread as read (PATCH /notifications/threads/{thread_id})—equivalent to clicking the notification in your inbox. " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Returns HTTP **205**. " +
            "See [Mark a thread as read](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#mark-a-thread-as-read).",
        {
            thread_id: z.number().int().positive().describe("The unique identifier of the notification thread.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.activity.markThreadAsRead({
                    thread_id: input.thread_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: MarkThreadAsReadSuccess = {
                    success: true,
                    message: "Notification thread marked as read successfully.",
                    http_status: response.status,
                    thread_id: input.thread_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: MarkThreadAsReadFailure = {
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
