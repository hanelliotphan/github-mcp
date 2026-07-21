import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetSelfHostedRunnersInGroupForOrgFailure,
    SetSelfHostedRunnersInGroupForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetSelfHostedRunnersInGroupForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_self_hosted_runners_in_group_for_org",
        "Replace the list of self-hosted runners that are part of an organization runner group (PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/runners). " +
            "Provide **`runners`** (the complete list of runner IDs). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Set self-hosted runners in a group for an organization](https://docs.github.com/en/rest/actions/self-hosted-runner-groups?apiVersion=2026-03-10#set-self-hosted-runners-in-a-group-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_group_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner group."),
            runners: z
                .array(z.number().int().positive())
                .describe("List of runner IDs to add to the runner group.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/runners",
                    {
                        org: input.org,
                        runner_group_id: input.runner_group_id,
                        runners: input.runners
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetSelfHostedRunnersInGroupForOrgSuccess = {
                    success: true,
                    message: "Runners set successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_group_id: input.runner_group_id,
                    runners: input.runners,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetSelfHostedRunnersInGroupForOrgFailure = {
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
