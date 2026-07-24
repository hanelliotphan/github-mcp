import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgTeamSyncGroupMappingsFailure,
    ListOrgTeamSyncGroupMappingsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

function extractGroups(data: unknown): Record<string, unknown>[] {
    if (data && typeof data === "object" && "groups" in data) {
        const rows = (data as { groups?: unknown }).groups;
        return Array.isArray(rows) ? toPlainRows(rows) : [];
    }
    return [];
}

export function registerGithubListOrgTeamSyncGroupMappingsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_team_sync_group_mappings",
        "List IdP groups connected to a team (GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings). " +
            "Team synchronization must be enabled. Response **`groups`** array is extracted from the API envelope. " +
            "See [List IdP groups for a team](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/team-sync?apiVersion=2026-03-10#list-idp-groups-for-a-team).",
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
                    "GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings",
                    {
                        org: input.org,
                        team_slug: input.team_slug
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListOrgTeamSyncGroupMappingsSuccess = {
                    success: true,
                    message: "Team IdP group mappings listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    groups: extractGroups(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgTeamSyncGroupMappingsFailure = {
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
