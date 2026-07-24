import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgTeamExternalGroupsFailure,
    DeleteOrgTeamExternalGroupsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgTeamExternalGroupsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_team_external_groups",
        "Remove the connection between an external group and a team (DELETE /orgs/{org}/teams/{team_slug}/external-groups). " +
            "Enterprise Managed Users only. Success is HTTP **204**. " +
            "See [Remove the connection between an external group and a team](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/external-groups?apiVersion=2026-03-10#remove-the-connection-between-an-external-group-and-a-team).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            team_slug: z.string().min(1).describe("The slug of the team name.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/teams/{team_slug}/external-groups",
                    {
                        org: input.org,
                        team_slug: input.team_slug
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgTeamExternalGroupsSuccess = {
                    success: true,
                    message: "Team external group connection removed successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgTeamExternalGroupsFailure = {
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
