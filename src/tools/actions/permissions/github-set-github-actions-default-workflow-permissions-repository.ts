import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetGithubActionsDefaultWorkflowPermissionsRepositoryFailure,
    SetGithubActionsDefaultWorkflowPermissionsRepositorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetGithubActionsDefaultWorkflowPermissionsRepositoryTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_github_actions_default_workflow_permissions_repository",
        "Set default workflow permissions for a repository (PUT /repos/{owner}/{repo}/actions/permissions/workflow). " +
            "Optionally set **`default_workflow_permissions`** (`read`/`write`) and **`can_approve_pull_request_reviews`** (boolean). " +
            "The authenticated user must have **admin** access. Classic OAuth apps and PATs need the **`repo`** scope. Success is HTTP **204**. " +
            "See [Set default workflow permissions for a repository](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-default-workflow-permissions-for-a-repository).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
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
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response =
                    await octokit.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository({
                        owner: input.owner,
                        repo: input.name,
                        ...(input.default_workflow_permissions !== undefined
                            ? { default_workflow_permissions: input.default_workflow_permissions }
                            : {}),
                        ...(input.can_approve_pull_request_reviews !== undefined
                            ? { can_approve_pull_request_reviews: input.can_approve_pull_request_reviews }
                            : {})
                    });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetGithubActionsDefaultWorkflowPermissionsRepositorySuccess = {
                    success: true,
                    message: "Default workflow permissions set successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetGithubActionsDefaultWorkflowPermissionsRepositoryFailure = {
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
