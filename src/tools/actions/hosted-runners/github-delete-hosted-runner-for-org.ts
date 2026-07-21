import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteHostedRunnerForOrgFailure,
    DeleteHostedRunnerForOrgSuccess,
    HostedRunnerItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_hosted_runner_for_org",
        "Delete a GitHub-hosted runner for an organization (DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}). " +
            "Success is HTTP **202** Accepted and returns the runner object (now transitioning to Deleting). " +
            "See [Delete a GitHub-hosted runner for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#delete-a-github-hosted-runner-for-an-organization).",
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
                const response = await octokit.rest.actions.deleteHostedRunnerForOrg({
                    org: input.org,
                    hosted_runner_id: input.hosted_runner_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Hosted runner deletion accepted.",
                    http_status: response.status,
                    org: input.org,
                    hosted_runner_id: input.hosted_runner_id,
                    runner: JSON.parse(JSON.stringify(response.data)) as HostedRunnerItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteHostedRunnerForOrgFailure = {
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
