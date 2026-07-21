import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListRunnerApplicationsForRepoFailure,
    ListRunnerApplicationsForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoRegex = /^[A-Za-z0-9._-]{1,100}$/;

export function registerGithubListRunnerApplicationsForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_runner_applications_for_repo",
        "List binaries for the self-hosted runner application that you can download and run for a repository (GET /repos/{owner}/{repo}/actions/runners/downloads). " +
            "Returns an array of runner applications (`os`, `architecture`, `download_url`, `filename`, …). " +
            "The authenticated user must have **admin** access to the repository; classic OAuth apps and PATs need the **`repo`** scope. " +
            "See [List runner applications for a repository](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#list-runner-applications-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerRegex, "owner must be a valid GitHub login"),
            name: z.string().min(1).max(100).regex(repoRegex, "name must be a valid repository name")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.listRunnerApplicationsForRepo({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const runner_applications = (Array.isArray(response.data) ? response.data : []).map(
                    (row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>
                );
                const successPayload: ListRunnerApplicationsForRepoSuccess = {
                    success: true,
                    message: "Runner applications listed successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    runner_applications,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListRunnerApplicationsForRepoFailure = {
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
