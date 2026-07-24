import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgTeamFailure, GetOrgTeamSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_team",
        "Get a team by slug (GET /orgs/{org}/teams/{team_slug}). OAuth tokens require **`read:org`** scope. " +
            "See [Get a team by name](https://docs.github.com/en/rest/teams/teams?apiVersion=2026-03-10#get-a-team-by-name).",
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
                const response = await octokit.rest.teams.getByName({
                    org: input.org,
                    team_slug: input.team_slug
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgTeamSuccess = {
                    success: true,
                    message: "Organization team retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    team: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgTeamFailure = {
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
