import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteSelfHostedRunnerFromRepoFailure,
    DeleteSelfHostedRunnerFromRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoRegex = /^[A-Za-z0-9._-]{1,100}$/;

export function registerGithubDeleteSelfHostedRunnerFromRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_self_hosted_runner_from_repo",
        "Forcefully remove a self-hosted runner from a repository (DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}). " +
            "Use this when the runner is offline and cannot be removed with a remove token. " +
            "The authenticated user must have **admin** access to the repository; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **204** with no content. " +
            "See [Delete a self-hosted runner from a repository](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#delete-a-self-hosted-runner-from-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerRegex, "owner must be a valid GitHub login"),
            name: z.string().min(1).max(100).regex(repoRegex, "name must be a valid repository name"),
            runner_id: z.number().int().positive().describe("Unique identifier of the self-hosted runner.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.deleteSelfHostedRunnerFromRepo({
                    owner: input.owner,
                    repo: input.name,
                    runner_id: input.runner_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteSelfHostedRunnerFromRepoSuccess = {
                    success: true,
                    message: "Self-hosted runner deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    runner_id: input.runner_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteSelfHostedRunnerFromRepoFailure = {
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
