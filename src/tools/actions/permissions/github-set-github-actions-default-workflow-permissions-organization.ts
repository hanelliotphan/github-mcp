import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetGithubActionsDefaultWorkflowPermissionsOrganizationFailure,
    SetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetGithubActionsDefaultWorkflowPermissionsOrganizationTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_github_actions_default_workflow_permissions_organization",
        "Set default workflow permissions for an organization (PUT /orgs/{org}/actions/permissions/workflow). " +
            "Optionally set **`default_workflow_permissions`** (`read`/`write`) and **`can_approve_pull_request_reviews`** (boolean). " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`admin:org`** scope. Success is HTTP **204**. " +
            "See [Set default workflow permissions for an organization](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-default-workflow-permissions-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            default_workflow_permissions: z
                .enum(["read", "write"])
                .optional()
                .describe("Default permissions granted to the GITHUB_TOKEN when running workflows."),
            can_approve_pull_request_reviews: z
                .boolean()
                .optional()
                .describe("Whether GitHub Actions can approve pull requests.")
        },
        async (input) => {
            try {
                const response =
                    await octokit.rest.actions.setGithubActionsDefaultWorkflowPermissionsOrganization({
                        org: input.org,
                        ...(input.default_workflow_permissions !== undefined
                            ? { default_workflow_permissions: input.default_workflow_permissions }
                            : {}),
                        ...(input.can_approve_pull_request_reviews !== undefined
                            ? { can_approve_pull_request_reviews: input.can_approve_pull_request_reviews }
                            : {})
                    });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetGithubActionsDefaultWorkflowPermissionsOrganizationSuccess = {
                    success: true,
                    message: "Default workflow permissions set successfully.",
                    http_status: response.status,
                    org: input.org,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetGithubActionsDefaultWorkflowPermissionsOrganizationFailure = {
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
