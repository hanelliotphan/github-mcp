import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetRepoAccessToSelfHostedRunnerGroupInOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_repo_access_to_self_hosted_runner_group_in_org",
        "Replace the list of repositories that have access to a self-hosted runner group in an organization (PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories). " +
            "Provide **`selected_repository_ids`** (the complete list). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Set repository access for a self-hosted runner group in an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#set-repository-access-for-a-self-hosted-runner-group-in-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_group_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner group."),
            selected_repository_ids: z
                .array(z.number().int().positive())
                .describe("List of repository IDs that can access the runner group.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories",
                    {
                        org: input.org,
                        runner_group_id: input.runner_group_id,
                        selected_repository_ids: input.selected_repository_ids
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetRepoAccessToSelfHostedRunnerGroupInOrgSuccess = {
                    success: true,
                    message: "Repository access set successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    selected_repository_ids: input.selected_repository_ids,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetRepoAccessToSelfHostedRunnerGroupInOrgFailure = {
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
