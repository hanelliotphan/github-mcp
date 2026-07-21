import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetSelfHostedRunnerGroupForOrgFailure,
    GetSelfHostedRunnerGroupForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetSelfHostedRunnerGroupForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_self_hosted_runner_group_for_org",
        "Get a specific self-hosted runner group for an organization (GET /orgs/{org}/actions/runner-groups/{runner_group_id}). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Get a self-hosted runner group for an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#get-a-self-hosted-runner-group-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_group_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner group.")
        },
        async (input) => {
            try {
                const response = await octokit.request("GET /orgs/{org}/actions/runner-groups/{runner_group_id}", {
                    org: input.org,
                    runner_group_id: input.runner_group_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetSelfHostedRunnerGroupForOrgSuccess = {
                    success: true,
                    message: "Runner group retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    runner_group: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetSelfHostedRunnerGroupForOrgFailure = {
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
