import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoViewsFailure, GetRepoViewsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoViewsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_views",
        "Get repository page views for the last 14 days (GET /repos/{owner}/{repo}/traffic/views). " +
            "Optional **`per`** is `day` (default) or `week`. Requires push access. " +
            "See [Get page views](https://docs.github.com/en/rest/metrics/traffic?apiVersion=2026-03-10#get-page-views).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            per: z.enum(["day", "week"]).optional().describe("Time frame for breakdown. Default: day.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getViews({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.per !== undefined ? { per: input.per } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoViewsSuccess = {
                    success: true,
                    message: "Repository page views retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    views: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoViewsFailure = {
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
