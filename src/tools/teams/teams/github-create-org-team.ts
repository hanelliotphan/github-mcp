import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateOrgTeamFailure, CreateOrgTeamSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateOrgTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_team",
        "Create a team in an organization (POST /orgs/{org}/teams). Success is HTTP **201**. " +
            "MCP **`team_name`** maps to API **`name`**. OAuth tokens require **`read:org`** scope. " +
            "See [Create a team](https://docs.github.com/en/rest/teams/teams?apiVersion=2026-03-10#create-a-team).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            team_name: z.string().min(1).describe("The display name of the team (maps to API name)."),
            description: z.string().optional(),
            maintainers: z.array(z.string().min(1)).optional(),
            repo_names: z.array(z.string().min(1)).optional(),
            privacy: z.enum(["secret", "closed"]).optional(),
            notification_setting: z.enum(["notifications_enabled", "notifications_disabled"]).optional(),
            parent_team_id: z.number().int().positive().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.teams.create({
                    org: input.org,
                    name: input.team_name,
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.maintainers !== undefined ? { maintainers: input.maintainers } : {}),
                    ...(input.repo_names !== undefined ? { repo_names: input.repo_names } : {}),
                    ...(input.privacy !== undefined ? { privacy: input.privacy } : {}),
                    ...(input.notification_setting !== undefined
                        ? { notification_setting: input.notification_setting }
                        : {}),
                    ...(input.parent_team_id !== undefined ? { parent_team_id: input.parent_team_id } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgTeamSuccess = {
                    success: true,
                    message: "Organization team created successfully.",
                    http_status: response.status,
                    org: input.org,
                    team: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgTeamFailure = {
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
