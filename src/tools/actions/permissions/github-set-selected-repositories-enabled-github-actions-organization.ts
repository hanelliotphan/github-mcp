import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetSelectedRepositoriesEnabledGithubActionsOrganizationFailure,
    SetSelectedRepositoriesEnabledGithubActionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetSelectedRepositoriesEnabledGithubActionsOrganizationTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_selected_repositories_enabled_github_actions_organization",
        "Replace the list of selected repositories enabled for GitHub Actions in an organization (PUT /orgs/{org}/actions/permissions/repositories). " +
            "Provide **`selected_repository_ids`** (array of repository IDs). Applies when the org permissions policy is set to `selected`. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Set selected repositories enabled for GitHub Actions in an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-selected-repositories-enabled-for-github-actions-in-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            selected_repository_ids: z
                .array(z.number().int())
                .describe("List of repository IDs to enable for GitHub Actions.")
        },
        async (input) => {
            try {
                const response =
                    await octokit.rest.actions.setSelectedRepositoriesEnabledGithubActionsOrganization({
                        org: input.org,
                        selected_repository_ids: input.selected_repository_ids
                    });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetSelectedRepositoriesEnabledGithubActionsOrganizationSuccess = {
                    success: true,
                    message: "Selected repositories set successfully.",
                    http_status: response.status,
                    org: input.org,
                    selected_repository_ids: input.selected_repository_ids,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetSelectedRepositoriesEnabledGithubActionsOrganizationFailure = {
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
