import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveAllOrgRolesForUserFailure,
    RemoveAllOrgRolesForUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveAllOrgRolesForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_all_org_roles_for_user",
        "Revoke **all** assigned organization roles from a user (DELETE /orgs/{org}/organization-roles/users/{username}). " +
            "Success is HTTP **204** No Content. " +
            "The authenticated user must be an **organization administrator**; classic OAuth apps and PATs need **`admin:org`** scope. " +
            "See [Remove all organization roles for a user](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#remove-all-organization-roles-for-a-user).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/organization-roles/users/{username}",
                    {
                        org: input.org,
                        username: input.username
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveAllOrgRolesForUserSuccess = {
                    success: true,
                    message: "All organization roles removed from the user successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveAllOrgRolesForUserFailure = {
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
