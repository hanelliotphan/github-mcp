import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteSelfHostedRunnerGroupFromOrgFailure,
    DeleteSelfHostedRunnerGroupFromOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteSelfHostedRunnerGroupFromOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_self_hosted_runner_group_from_org",
        "Delete a self-hosted runner group from an organization (DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Delete a self-hosted runner group from an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#delete-a-self-hosted-runner-group-from-an-organization).",
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
                const response = await octokit.request("DELETE /orgs/{org}/actions/runner-groups/{runner_group_id}", {
                    org: input.org,
                    runner_group_id: input.runner_group_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteSelfHostedRunnerGroupFromOrgSuccess = {
                    success: true,
                    message: "Runner group deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteSelfHostedRunnerGroupFromOrgFailure = {
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
