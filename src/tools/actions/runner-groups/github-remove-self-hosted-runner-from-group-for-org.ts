import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveSelfHostedRunnerFromGroupForOrgFailure,
    RemoveSelfHostedRunnerFromGroupForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveSelfHostedRunnerFromGroupForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_self_hosted_runner_from_group_for_org",
        "Remove a self-hosted runner from a group configured in an organization; the runner is then returned to the default group (DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id}). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Remove a self-hosted runner from a group for an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#remove-a-self-hosted-runner-from-a-group-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_group_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner group."),
            runner_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id}",
                    {
                        org: input.org,
                        runner_group_id: input.runner_group_id,
                        runner_id: input.runner_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveSelfHostedRunnerFromGroupForOrgSuccess = {
                    success: true,
                    message: "Runner removed from group successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    runner_id: input.runner_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveSelfHostedRunnerFromGroupForOrgFailure = {
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
