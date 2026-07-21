import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetGithubActionsPermissionsRepositoryFailure,
    SetGithubActionsPermissionsRepositorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetGithubActionsPermissionsRepositoryTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_github_actions_permissions_repository",
        "Set GitHub Actions permissions policy for a repository (PUT /repos/{owner}/{repo}/actions/permissions). " +
            "Provide **`enabled`** (boolean) and optionally **`allowed_actions`** (`all`, `local_only`, or `selected`). " +
            "The authenticated user must have **admin** access. Classic OAuth apps and PATs need the **`repo`** scope. Success is HTTP **204**. " +
            "See [Set GitHub Actions permissions for a repository](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-github-actions-permissions-for-a-repository).",
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
            enabled: z.boolean().describe("Whether GitHub Actions is enabled on the repository."),
            allowed_actions: z
                .enum(["all", "local_only", "selected"])
                .optional()
                .describe("The permissions policy that controls the actions and reusable workflows allowed to run.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.setGithubActionsPermissionsRepository({
                    owner: input.owner,
                    repo: input.name,
                    enabled: input.enabled,
                    ...(input.allowed_actions !== undefined ? { allowed_actions: input.allowed_actions } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetGithubActionsPermissionsRepositorySuccess = {
                    success: true,
                    message: "Repository Actions permissions set successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetGithubActionsPermissionsRepositoryFailure = {
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
