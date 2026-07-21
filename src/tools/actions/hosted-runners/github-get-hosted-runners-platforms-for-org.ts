import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetHostedRunnersPlatformsForOrgFailure,
    GetHostedRunnersPlatformsForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseBody(data: unknown): { total_count: number; platforms: string[] } {
    if (data && typeof data === "object" && "platforms" in data) {
        const o = data as Record<string, unknown>;
        const platforms = Array.isArray(o.platforms)
            ? o.platforms.filter((p): p is string => typeof p === "string")
            : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : platforms.length;
        return { total_count, platforms };
    }
    return { total_count: 0, platforms: [] };
}

export function registerGithubGetHostedRunnersPlatformsForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_hosted_runners_platforms_for_org",
        "Get platforms available for GitHub-hosted runners in an organization (GET /orgs/{org}/actions/hosted-runners/platforms). " +
            "Returns **`total_count`** and **`platforms`** (array of strings). " +
            "See [Get platforms for GitHub-hosted runners in an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#get-platforms-for-github-hosted-runners-in-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getHostedRunnersPlatformsForOrg({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: GetHostedRunnersPlatformsForOrgSuccess = {
                    success: true,
                    message: "Hosted runner platforms retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: parsed.total_count,
                    platforms: parsed.platforms,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetHostedRunnersPlatformsForOrgFailure = {
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
