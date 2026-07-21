import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DisableSelectedRepositoryGithubActionsOrganizationFailure,
    DisableSelectedRepositoryGithubActionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDisableSelectedRepositoryGithubActionsOrganizationTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_disable_selected_repository_github_actions_organization",
        "Disable a selected repository for GitHub Actions in an organization (DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}). " +
            "Applies when the org permissions policy is set to `selected`. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Disable a selected repository for GitHub Actions in an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#disable-a-selected-repository-for-github-actions-in-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            repository_id: z.number().int().positive().describe("The unique identifier of the repository.")
        },
        async (input) => {
            try {
                const response =
                    await octokit.rest.actions.disableSelectedRepositoryGithubActionsOrganization({
                        org: input.org,
                        repository_id: input.repository_id
                    });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DisableSelectedRepositoryGithubActionsOrganizationSuccess = {
                    success: true,
                    message: "Repository disabled for GitHub Actions successfully.",
                    http_status: response.status,
                    org: input.org,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DisableSelectedRepositoryGithubActionsOrganizationFailure = {
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
