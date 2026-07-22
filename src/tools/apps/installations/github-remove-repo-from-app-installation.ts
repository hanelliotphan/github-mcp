import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveRepoFromAppInstallationFailure,
    RemoveRepoFromAppInstallationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubRemoveRepoFromAppInstallationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_repo_from_app_installation",
        "Remove a repository from a GitHub App installation " +
            "(DELETE /user/installations/{installation_id}/repositories/{repository_id}). " +
            "The authenticated user must have **admin** access to the repository. " +
            "The installation must have **`repository_selection`** of **`selected`**. " +
            "This endpoint only works for **classic PATs** with the **`repo`** scope (not fine-grained tokens or installation tokens). " +
            "Returns **204** on success (**422** if the app is installed on all repos or this would remove the last repo). " +
            "See [Remove a repository from an app installation](https://docs.github.com/en/rest/apps/installations?apiVersion=2026-03-10#remove-a-repository-from-an-app-installation).",
        {
            installation_id: z.number().int().min(1).describe("The unique identifier of the installation."),
            repository_id: z.number().int().min(1).describe("The unique identifier of the repository.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.removeRepoFromInstallationForAuthenticatedUser({
                    installation_id: input.installation_id,
                    repository_id: input.repository_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveRepoFromAppInstallationSuccess = {
                    success: true,
                    message: "Repository removed from app installation successfully.",
                    http_status: response.status,
                    installation_id: input.installation_id,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveRepoFromAppInstallationFailure = {
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