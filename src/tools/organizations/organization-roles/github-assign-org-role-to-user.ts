import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AssignOrgRoleToUserFailure,
    AssignOrgRoleToUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubAssignOrgRoleToUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_assign_org_role_to_user",
        "Assign an **organization role** to an organization member (PUT /orgs/{org}/organization-roles/users/{username}/{role_id}). " +
            "Success is HTTP **204** No Content. " +
            "The authenticated user must be an **organization administrator**; classic OAuth apps and PATs need **`admin:org`** scope. " +
            "**404** if org/user/role is missing; **422** if the organization roles feature is disabled or the user is not an org member. " +
            "See [Assign an organization role to a user](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#assign-an-organization-role-to-a-user).",
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
                ),
            role_id: z.number().int().positive().describe("The unique identifier of the role.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/organization-roles/users/{username}/{role_id}",
                    {
                        org: input.org,
                        username: input.username,
                        role_id: input.role_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AssignOrgRoleToUserSuccess = {
                    success: true,
                    message: "Organization role assigned to the user successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    role_id: input.role_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AssignOrgRoleToUserFailure = {
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
