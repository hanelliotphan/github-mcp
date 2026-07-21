import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddRepoAccessToSelfHostedRunnerGroupInOrgFailure,
    AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubAddRepoAccessToSelfHostedRunnerGroupInOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_repo_access_to_self_hosted_runner_group_in_org",
        "Add a repository to the list of repositories that can access a self-hosted runner group in an organization (PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}). " +
            "The runner group must have visibility set to `selected`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Add repository access to a self-hosted runner group in an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#add-repository-access-to-a-self-hosted-runner-group-in-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_group_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner group."),
            repository_id: z.number().int().positive().describe("The unique identifier of the repository.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}",
                    {
                        org: input.org,
                        runner_group_id: input.runner_group_id,
                        repository_id: input.repository_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddRepoAccessToSelfHostedRunnerGroupInOrgSuccess = {
                    success: true,
                    message: "Repository access added successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddRepoAccessToSelfHostedRunnerGroupInOrgFailure = {
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
