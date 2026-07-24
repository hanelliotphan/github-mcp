import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateOrgTeamExternalGroupsFailure,
    UpdateOrgTeamExternalGroupsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateOrgTeamExternalGroupsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_team_external_groups",
        "Update the connection between an external group and a team (PATCH /orgs/{org}/teams/{team_slug}/external-groups). " +
            "Enterprise Managed Users only. Only one external group can be linked to a team. " +
            "See [Update the connection between an external group and a team](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/external-groups?apiVersion=2026-03-10#update-the-connection-between-an-external-group-and-a-team).",
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
            group_id: z.number().int().positive().describe("External group ID.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /orgs/{org}/teams/{team_slug}/external-groups",
                    {
                        org: input.org,
                        team_slug: input.team_slug,
                        group_id: input.group_id
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgTeamExternalGroupsSuccess = {
                    success: true,
                    message: "Team external group connection updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    group_id: input.group_id,
                    external_group: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgTeamExternalGroupsFailure = {
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
