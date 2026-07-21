import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetGithubActionsPermissionsOrganizationFailure,
    SetGithubActionsPermissionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetGithubActionsPermissionsOrganizationTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_github_actions_permissions_organization",
        "Set GitHub Actions permissions policy for an organization (PUT /orgs/{org}/actions/permissions). " +
            "Provide **`enabled_repositories`** (`all`, `none`, or `selected`) and optionally **`allowed_actions`** (`all`, `local_only`, or `selected`). " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Set GitHub Actions permissions for an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-github-actions-permissions-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            enabled_repositories: z
                .enum(["all", "none", "selected"])
                .describe("The policy that controls which repositories can use GitHub Actions."),
            allowed_actions: z
                .enum(["all", "local_only", "selected"])
                .optional()
                .describe("The permissions policy that controls the actions and reusable workflows allowed to run.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.setGithubActionsPermissionsOrganization({
                    org: input.org,
                    enabled_repositories: input.enabled_repositories,
                    ...(input.allowed_actions !== undefined ? { allowed_actions: input.allowed_actions } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetGithubActionsPermissionsOrganizationSuccess = {
                    success: true,
                    message: "Organization Actions permissions set successfully.",
                    http_status: response.status,
                    org: input.org,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetGithubActionsPermissionsOrganizationFailure = {
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
