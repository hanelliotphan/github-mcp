import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateSelfHostedRunnerGroupForOrgFailure,
    UpdateSelfHostedRunnerGroupForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubUpdateSelfHostedRunnerGroupForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_self_hosted_runner_group_for_org",
        "Update the name and visibility of a self-hosted runner group in an organization (PATCH /orgs/{org}/actions/runner-groups/{runner_group_id}). " +
            "Provide **`name`** and optionally `visibility` (`selected`|`all`|`private`), `allows_public_repositories`, `restricted_to_workflows`, `selected_workflows`, and `network_configuration_id`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. Returns HTTP **200** with the updated group. " +
            "See [Update a self-hosted runner group for an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#update-a-self-hosted-runner-group-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_group_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner group."),
            name: z.string().min(1).describe("Name of the runner group."),
            visibility: z.enum(["selected", "all", "private"]).optional(),
            allows_public_repositories: z.boolean().optional(),
            restricted_to_workflows: z.boolean().optional(),
            selected_workflows: z.array(z.string()).optional(),
            network_configuration_id: z.string().nullable().optional()
        },
        async (input) => {
            try {
                const response = await octokit.request("PATCH /orgs/{org}/actions/runner-groups/{runner_group_id}", {
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    name: input.name,
                    ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
                    ...(input.allows_public_repositories !== undefined
                        ? { allows_public_repositories: input.allows_public_repositories }
                        : {}),
                    ...(input.restricted_to_workflows !== undefined
                        ? { restricted_to_workflows: input.restricted_to_workflows }
                        : {}),
                    ...(input.selected_workflows !== undefined
                        ? { selected_workflows: input.selected_workflows }
                        : {}),
                    ...(input.network_configuration_id !== undefined
                        ? { network_configuration_id: input.network_configuration_id }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateSelfHostedRunnerGroupForOrgSuccess = {
                    success: true,
                    message: "Runner group updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    runner_group: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateSelfHostedRunnerGroupForOrgFailure = {
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
