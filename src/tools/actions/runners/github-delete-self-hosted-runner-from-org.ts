import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteSelfHostedRunnerFromOrgFailure,
    DeleteSelfHostedRunnerFromOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteSelfHostedRunnerFromOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_self_hosted_runner_from_org",
        "Forcefully remove a self-hosted runner from an organization (DELETE /orgs/{org}/actions/runners/{runner_id}). " +
            "Use this when the runner is offline and cannot be removed with a remove token. " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. Returns HTTP **204** with no content. " +
            "See [Delete a self-hosted runner from an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#delete-a-self-hosted-runner-from-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            runner_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.deleteSelfHostedRunnerFromOrg({
                    org: input.org,
                    runner_id: input.runner_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteSelfHostedRunnerFromOrgSuccess = {
                    success: true,
                    message: "Self-hosted runner deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_id: input.runner_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteSelfHostedRunnerFromOrgFailure = {
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
