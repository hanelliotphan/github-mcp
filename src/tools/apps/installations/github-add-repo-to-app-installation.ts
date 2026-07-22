import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AddRepoToAppInstallationFailure, AddRepoToAppInstallationSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubAddRepoToAppInstallationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_repo_to_app_installation",
        "Add a repository to a GitHub App installation " +
            "(PUT /user/installations/{installation_id}/repositories/{repository_id}). " +
            "The authenticated user must have **admin** access to the repository. " +
            "This endpoint only works for **classic PATs** with the **`repo`** scope (not fine-grained tokens or installation tokens). " +
            "Returns **204** on success. " +
            "See [Add a repository to an app installation](https://docs.github.com/en/rest/apps/installations?apiVersion=2026-03-10#add-a-repository-to-an-app-installation).",
        {
            installation_id: z.number().int().min(1).describe("The unique identifier of the installation."),
            repository_id: z.number().int().min(1).describe("The unique identifier of the repository.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.addRepoToInstallationForAuthenticatedUser({
                    installation_id: input.installation_id,
                    repository_id: input.repository_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddRepoToAppInstallationSuccess = {
                    success: true,
                    message: "Repository added to app installation successfully.",
                    http_status: response.status,
                    installation_id: input.installation_id,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddRepoToAppInstallationFailure = {
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
