import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    MarkRepoNotificationsAsReadFailure,
    MarkRepoNotificationsAsReadSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function readString(data: unknown, key: string): string | undefined {
    if (data && typeof data === "object" && key in data) {
        const value = (data as Record<string, unknown>)[key];
        return typeof value === "string" ? value : undefined;
    }
    return undefined;
}

export function registerGithubMarkRepoNotificationsAsReadTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_mark_repo_notifications_as_read",
        "Mark all notifications in a repository as read for the authenticated user (PUT /repos/{owner}/{repo}/notifications). " +
            "Requires a classic PAT with the **`notifications`** or **`repo`** scope. Optionally set **`last_read_at`** (ISO 8601; anything updated after is not marked). " +
            "If there are too many notifications, GitHub processes asynchronously and returns HTTP **202**; otherwise **205**. " +
            "See [Mark repository notifications as read](https://docs.github.com/en/rest/activity/notifications?apiVersion=2026-03-10#mark-repository-notifications-as-read).",
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
            last_read_at: z
                .string()
                .optional()
                .describe("ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SSZ) marking the last point notifications were checked. Defaults to the current time.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.activity.markRepoNotificationsAsRead({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.last_read_at ? { last_read_at: input.last_read_at } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const apiMessage = readString(response.data, "message");
                const url = readString(response.data, "url");
                const successPayload: MarkRepoNotificationsAsReadSuccess = {
                    success: true,
                    message:
                        response.status === 202
                            ? "Repository notifications are being marked as read asynchronously (too many to complete synchronously)."
                            : "Repository notifications marked as read successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    ...(apiMessage ? { api_message: apiMessage } : {}),
                    ...(url ? { url } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: MarkRepoNotificationsAsReadFailure = {
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
