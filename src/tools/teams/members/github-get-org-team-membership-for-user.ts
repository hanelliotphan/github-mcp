import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgTeamMembershipForUserFailure,
    GetOrgTeamMembershipForUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgTeamMembershipForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_team_membership_for_user",
        "Get team membership for a user (GET /orgs/{org}/teams/{team_slug}/memberships/{username}). " +
            "See [Get team membership for a user](https://docs.github.com/en/rest/teams/members?apiVersion=2026-03-10#get-team-membership-for-a-user).",
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
                const response = await octokit.rest.teams.getMembershipForUserInOrg({
                    org: input.org,
                    team_slug: input.team_slug,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgTeamMembershipForUserSuccess = {
                    success: true,
                    message: "Team membership retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    username: input.username,
                    membership: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgTeamMembershipForUserFailure = {
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
