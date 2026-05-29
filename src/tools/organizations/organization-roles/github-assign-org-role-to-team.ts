import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AssignOrgRoleToTeamFailure,
    AssignOrgRoleToTeamSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubAssignOrgRoleToTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_assign_org_role_to_team",
        "Assign an **organization role** to a team (PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}). " +
            "Success is HTTP **204** No Content. " +
            "The authenticated user must be an **organization administrator**; classic OAuth apps and PATs need **`admin:org`** scope. **404** if org/team/role is missing; **422** if the organization roles feature is not enabled. " +
            "See [Assign an organization role to a team](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#assign-an-organization-role-to-a-team).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            team_slug: z.string().min(1).describe("The slug of the team name."),
            role_id: z.number().int().positive().describe("The unique identifier of the role.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}",
                    {
                        org: input.org,
                        team_slug: input.team_slug,
                        role_id: input.role_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AssignOrgRoleToTeamSuccess = {
                    success: true,
                    message: "Organization role assigned to the team successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    role_id: input.role_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AssignOrgRoleToTeamFailure = {
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
