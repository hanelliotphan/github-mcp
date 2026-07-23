import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateEnterpriseTeamFailure, UpdateEnterpriseTeamSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateEnterpriseTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_enterprise_team",
        "Update an enterprise team (PATCH /enterprises/{enterprise}/teams/{team_slug}). " +
            "Optional **`sync_to_organizations`** is retired and no longer supported by GitHub. " +
            "Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Update an enterprise team](https://docs.github.com/en/rest/enterprise-teams/enterprise-teams?apiVersion=2026-03-10#update-an-enterprise-team).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(50)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
            team_slug: z.string().min(1).describe("The slug of the enterprise team."),
            name: z.string().min(1).optional(),
            description: z.string().nullable().optional(),
            organization_selection_type: z.enum(["disabled", "selected", "all"]).optional(),
            group_id: z.string().nullable().optional(),
            notification_setting: z.enum(["notifications_enabled", "notifications_disabled"]).optional(),
            sync_to_organizations: z
                .enum(["all", "disabled"])
                .optional()
                .describe("Retired: this field is no longer supported by GitHub.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.enterpriseTeams.update({
                    enterprise: input.enterprise,
                    team_slug: input.team_slug,
                    ...(input.name !== undefined ? { name: input.name } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.organization_selection_type !== undefined
                        ? { organization_selection_type: input.organization_selection_type }
                        : {}),
                    ...(input.group_id !== undefined ? { group_id: input.group_id } : {}),
                    ...(input.notification_setting !== undefined
                        ? { notification_setting: input.notification_setting }
                        : {}),
                    ...(input.sync_to_organizations !== undefined
                        ? { sync_to_organizations: input.sync_to_organizations }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateEnterpriseTeamSuccess = {
                    success: true,
                    message: "Enterprise team updated successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    team_slug: input.team_slug,
                    team: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateEnterpriseTeamFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
