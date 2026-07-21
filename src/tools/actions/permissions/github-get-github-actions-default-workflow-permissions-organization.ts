import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetGithubActionsDefaultWorkflowPermissionsOrganizationFailure,
    GetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetGithubActionsDefaultWorkflowPermissionsOrganizationTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_github_actions_default_workflow_permissions_organization",
        "Get default workflow permissions for an organization (GET /orgs/{org}/actions/permissions/workflow). " +
            "Returns `default_workflow_permissions` (`read`/`write`) and `can_approve_pull_request_reviews`. " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. " +
            "See [Get default workflow permissions for an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#get-default-workflow-permissions-for-an-organization).",
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
                const response =
                    await octokit.rest.actions.getGithubActionsDefaultWorkflowPermissionsOrganization({
                        org: input.org
                    });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess = {
                    success: true,
                    message: "Default workflow permissions retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    permissions: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetGithubActionsDefaultWorkflowPermissionsOrganizationFailure = {
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
