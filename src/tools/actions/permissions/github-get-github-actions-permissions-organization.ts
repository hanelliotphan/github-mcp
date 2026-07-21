import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetGithubActionsPermissionsOrganizationFailure,
    GetGithubActionsPermissionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetGithubActionsPermissionsOrganizationTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_github_actions_permissions_organization",
        "Get GitHub Actions permissions policy for an organization (GET /orgs/{org}/actions/permissions). " +
            "Returns `enabled_repositories`, `allowed_actions`, and `selected_actions_url`. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Get GitHub Actions permissions for an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#get-github-actions-permissions-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getGithubActionsPermissionsOrganization({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetGithubActionsPermissionsOrganizationSuccess = {
                    success: true,
                    message: "Organization Actions permissions retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    permissions: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetGithubActionsPermissionsOrganizationFailure = {
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
