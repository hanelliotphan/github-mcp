import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetSelfHostedRunnerForOrgFailure,
    GetSelfHostedRunnerForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetSelfHostedRunnerForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_self_hosted_runner_for_org",
        "Get a specific self-hosted runner configured in an organization (GET /orgs/{org}/actions/runners/{runner_id}). " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Get a self-hosted runner for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#get-a-self-hosted-runner-for-an-organization).",
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
                const response = await octokit.rest.actions.getSelfHostedRunnerForOrg({
                    org: input.org,
                    runner_id: input.runner_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetSelfHostedRunnerForOrgSuccess = {
                    success: true,
                    message: "Self-hosted runner retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_id: input.runner_id,
                    runner: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetSelfHostedRunnerForOrgFailure = {
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
