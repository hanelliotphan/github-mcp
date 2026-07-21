import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRunnerApplicationsForOrgFailure,
    ListRunnerApplicationsForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubListRunnerApplicationsForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_runner_applications_for_org",
        "List binaries for the self-hosted runner application that you can download and run for an organization (GET /orgs/{org}/actions/runners/downloads). " +
            "Returns an array of runner applications (`os`, `architecture`, `download_url`, `filename`, …). " +
            "The authenticated user must have **admin** access; classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [List runner applications for an organization](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#list-runner-applications-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.listRunnerApplicationsForOrg({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const runner_applications = (Array.isArray(response.data) ? response.data : []).map(
                    (row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>
                );
                const successPayload: ListRunnerApplicationsForOrgSuccess = {
                    success: true,
                    message: "Runner applications listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    runner_applications,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRunnerApplicationsForOrgFailure = {
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
