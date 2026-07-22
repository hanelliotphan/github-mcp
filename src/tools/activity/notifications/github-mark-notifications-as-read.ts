import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    MarkNotificationsAsReadFailure,
    MarkNotificationsAsReadSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function readApiMessage(data: unknown): string | undefined {
    if (data && typeof data === "object" && "message" in data) {
        const value = (data as Record<string, unknown>).message;
        return typeof value === "string" ? value : undefined;
    }
    return undefined;
}

export function registerGithubMarkNotificationsAsReadTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_mark_notifications_as_read",
        "Mark all notifications as read for the authenticated user (PUT /notifications). " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Optionally set **`last_read_at`** (ISO 8601; anything updated after is not marked) " +
            "and **`read`**. If there are too many notifications, GitHub processes asynchronously and returns HTTP **202**; otherwise **205**. " +
            "See [Mark notifications as read](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#mark-notifications-as-read).",
        {
            last_read_at: z
                .string()
                .optional()
                .describe("ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ) marking the last point notifications were checked. Defaults to the current time."),
            read: z.boolean().optional().describe("Whether the notification has been read.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.activity.markNotificationsAsRead({
                    ...(input.last_read_at ? { last_read_at: input.last_read_at } : {}),
                    ...(input.read !== undefined ? { read: input.read } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const apiMessage = readApiMessage(response.data);
                const successPayload: MarkNotificationsAsReadSuccess = {
                    success: true,
                    message:
                        response.status === 202
                            ? "Notifications are being marked as read asynchronously (too many to complete synchronously)."
                            : "Notifications marked as read successfully.",
                    http_status: response.status,
                    ...(apiMessage ? { api_message: apiMessage } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: MarkNotificationsAsReadFailure = {
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
