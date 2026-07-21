import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetHostedRunnersLimitsForOrgFailure,
    GetHostedRunnersLimitsForOrgSuccess,
    HostedRunnerItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetHostedRunnersLimitsForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_hosted_runners_limits_for_org",
        "Get GitHub-hosted runner limits for an organization (GET /orgs/{org}/actions/hosted-runners/limits). " +
            "Returns `public_ips` limits (`maximum`, `current_usage`). " +
            "See [Get limits on GitHub-hosted runners for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#get-limits-on-github-hosted-runners-for-an-organization).",
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
                const response = await octokit.rest.actions.getHostedRunnersLimitsForOrg({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetHostedRunnersLimitsForOrgSuccess = {
                    success: true,
                    message: "Hosted runner limits retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    limits: JSON.parse(JSON.stringify(response.data)) as HostedRunnerItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetHostedRunnersLimitsForOrgFailure = {
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
