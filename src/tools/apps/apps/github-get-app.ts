import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetAppFailure, GetAppSuccess, GitHubAppItem } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): GitHubAppItem {
    return JSON.parse(JSON.stringify(data)) as GitHubAppItem;
}

export function registerGithubGetAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_app",
        "Get a GitHub App by its URL-friendly slug (GET /apps/{app_slug}). " +
            "Find the slug on the app settings page (e.g. https://github.com/settings/apps/:app_slug). " +
            "See [Get an app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#get-an-app).",
        {
            app_slug: z.string().min(1).describe("URL-friendly name of the GitHub App.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.getBySlug({ app_slug: input.app_slug });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAppSuccess = {
                    success: true,
                    message: "GitHub App retrieved successfully.",
                    http_status: response.status,
                    app_slug: input.app_slug,
                    app: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAppFailure = {
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
