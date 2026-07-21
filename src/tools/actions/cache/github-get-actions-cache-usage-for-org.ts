import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetActionsCacheUsageForOrgFailure,
    GetActionsCacheUsageForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetActionsCacheUsageForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_actions_cache_usage_for_org",
        "Get the total GitHub Actions cache usage for an organization (GET /orgs/{org}/actions/cache/usage). " +
            "Returns `total_active_caches_size_in_bytes` and `total_active_caches_count`. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Get GitHub Actions cache usage for an organization](https://docs.github.com/en/rest/actions/cache?apiVersion=2026-03-10#get-github-actions-cache-usage-for-an-organization).",
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
                const response = await octokit.rest.actions.getActionsCacheUsageForOrg({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetActionsCacheUsageForOrgSuccess = {
                    success: true,
                    message: "Organization Actions cache usage retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    usage: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetActionsCacheUsageForOrgFailure = {
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
