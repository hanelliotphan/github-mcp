import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    MarkThreadAsDoneFailure,
    MarkThreadAsDoneSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubMarkThreadAsDoneTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_mark_thread_as_done",
        "Mark a notification thread as done (DELETE /notifications/threads/{thread_id})—equivalent to marking a notification as done in your inbox. " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Returns HTTP **204**. " +
            "See [Mark a thread as done](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#mark-a-thread-as-done).",
        {
            thread_id: z.number().int().positive().describe("The unique identifier of the notification thread.")
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /notifications/threads/{thread_id}", {
                    thread_id: input.thread_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: MarkThreadAsDoneSuccess = {
                    success: true,
                    message: "Notification thread marked as done successfully.",
                    http_status: response.status,
                    thread_id: input.thread_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: MarkThreadAsDoneFailure = {
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
