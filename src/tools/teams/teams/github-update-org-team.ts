import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateOrgTeamFailure, UpdateOrgTeamSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateOrgTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_team",
        "Update a team (PATCH /orgs/{org}/teams/{team_slug}). Success is HTTP **200** or **201**. " +
            "MCP **`team_name`** maps to API **`name`**. **`permission`** (pull|push|admin) is closing down. " +
            "See [Update a team](https://docs.github.com/en/rest/teams/teams?apiVersion=2026-03-10#update-a-team).",
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
            team_name: z.string().min(1).optional().describe("The display name of the team (maps to API name)."),
            description: z.string().optional(),
            privacy: z.enum(["secret", "closed"]).optional(),
            notification_setting: z.enum(["notifications_enabled", "notifications_disabled"]).optional(),
            permission: z.enum(["pull", "push", "admin"]).optional(),
            parent_team_id: z.number().int().positive().nullable().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.teams.updateInOrg({
                    org: input.org,
                    team_slug: input.team_slug,
                    ...(input.team_name !== undefined ? { name: input.team_name } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.privacy !== undefined ? { privacy: input.privacy } : {}),
                    ...(input.notification_setting !== undefined
                        ? { notification_setting: input.notification_setting }
                        : {}),
                    ...(input.permission !== undefined ? { permission: input.permission } : {}),
                    ...(input.parent_team_id !== undefined ? { parent_team_id: input.parent_team_id } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgTeamSuccess = {
                    success: true,
                    message: "Organization team updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    team: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgTeamFailure = {
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
