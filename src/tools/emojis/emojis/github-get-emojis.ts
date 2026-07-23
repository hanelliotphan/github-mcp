import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { GetEmojisFailure, GetEmojisSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainStringMap(data: unknown): Record<string, string> {
    const plain = JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(plain)) {
        if (typeof value === "string") {
            out[key] = value;
        }
    }
    return out;
}

export function registerGithubGetEmojisTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_emojis",
        "List all emojis available to use on GitHub (GET /emojis). Returns a map of emoji shortcode names to image URLs. " +
            "See [Get emojis](https://docs.github.com/en/rest/emojis/emojis?apiVersion=2026-03-10#get-emojis).",
        {},
        async () => {
            try {
                const response = await octokit.rest.emojis.get();
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const emojis = toPlainStringMap(response.data);
                const successPayload: GetEmojisSuccess = {
                    success: true,
                    message: "Emojis retrieved successfully.",
                    http_status: response.status as number,
                    emoji_count: Object.keys(emojis).length,
                    emojis,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetEmojisFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
