import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type {
    GetFeedsFailure,
    GetFeedsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetFeedsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_feeds",
        "List the feeds available to the authenticated user (GET /feeds). " +
            "The response provides a URL for each feed (timeline, user, current-user public/private/actor/organizations, and security advisories); " +
            "you can then fetch a specific feed by requesting one of the returned URLs. " +
            "Note: private feed URLs are only returned when authenticating via Basic Auth. Returns HTTP **200**. " +
            "See [Get feeds](https://docs.github.com/en/rest/activity/feeds?apiVersion=2026-03-10#get-feeds).",
        {},
        async () => {
            try {
                const response = await octokit.rest.activity.getFeeds();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetFeedsSuccess = {
                    success: true,
                    message: "Feeds retrieved successfully.",
                    http_status: response.status,
                    feeds: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetFeedsFailure = {
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
