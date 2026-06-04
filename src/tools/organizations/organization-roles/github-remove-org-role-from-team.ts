import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveOrgRoleFromTeamFailure,
    RemoveOrgRoleFromTeamSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgRoleFromTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_role_from_team",
        "Remove a single **organization role** from a team (DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}). " +
            "Success is HTTP **204** No Content. " +
            "The authenticated user must be an **organization administrator**; classic OAuth apps and PATs need **`admin:org`** scope. " +
            "To remove **all** roles from a team, use **`github_remove_all_org_roles_for_team`**. " +
            "See [Remove an organization role from a team](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#remove-an-organization-role-from-a-team).",
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
                    "DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}",
                    {
                        org: input.org,
                        team_slug: input.team_slug,
                        role_id: input.role_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgRoleFromTeamSuccess = {
                    success: true,
                    message: "Organization role removed from the team successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    role_id: input.role_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgRoleFromTeamFailure = {
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
