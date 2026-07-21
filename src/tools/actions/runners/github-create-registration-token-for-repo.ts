import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRegistrationTokenForRepoFailure,
    CreateRegistrationTokenForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoRegex = /^[A-Za-z0-9._-]{1,100}$/;

export function registerGithubCreateRegistrationTokenForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_registration_token_for_repo",
        "Create a registration token for adding a self-hosted runner to a repository (POST /repos/{owner}/{repo}/actions/runners/registration-token). " +
            "The returned **`token`** is used with the runner config script and expires after one hour. " +
            "The authenticated user must have **admin** access to the repository; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201**. " +
            "See [Create a registration token for a repository](https://docs.github.com/en/rest/actions/self-hosted-runners?apiVersion=2026-03-10#create-a-registration-token-for-a-repository).",
        {
            owner: z.string().min(1).max(39).regex(ownerRegex, "owner must be a valid GitHub login"),
            name: z.string().min(1).max(100).regex(repoRegex, "name must be a valid repository name")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.createRegistrationTokenForRepo({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRegistrationTokenForRepoSuccess = {
                    success: true,
                    message: "Registration token created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    token: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRegistrationTokenForRepoFailure = {
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
