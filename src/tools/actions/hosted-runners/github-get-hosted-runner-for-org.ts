import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetHostedRunnerForOrgFailure,
    GetHostedRunnerForOrgSuccess,
    HostedRunnerItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_hosted_runner_for_org",
        "Get a GitHub-hosted runner configured in an organization (GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}). " +
            "Returns the runner object (`id`, `name`, `runner_group_id`, `image_details`, `machine_size_details`, `status`, `platform`, …). " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. " +
            "See [Get a GitHub-hosted runner for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#get-a-github-hosted-runner-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            hosted_runner_id: z
                .number()
                .int()
                .positive()
                .describe("Unique identifier of the GitHub-hosted runner.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getHostedRunnerForOrg({
                    org: input.org,
                    hosted_runner_id: input.hosted_runner_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Hosted runner retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    hosted_runner_id: input.hosted_runner_id,
                    runner: JSON.parse(JSON.stringify(response.data)) as HostedRunnerItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetHostedRunnerForOrgFailure = {
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
