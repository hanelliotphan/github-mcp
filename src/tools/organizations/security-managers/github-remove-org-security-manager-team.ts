import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveOrgSecurityManagerTeamFailure,
    RemoveOrgSecurityManagerTeamSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgSecurityManagerTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_security_manager_team",
        "Remove a **security manager team** from an organization (DELETE /orgs/{org}/security-managers/teams/{team_slug}). " +
            "Revokes the team's security manager permissions across the org. " +
            "Success is HTTP **204** No Content. " +
            "**Deprecation:** GitHub is closing down this API (removal from **January 1, 2026**); prefer **Organization Roles** endpoints instead. " +
            "See [Remove a security manager team](https://docs.github.com/en/rest/orgs/security-managers?apiVersion=2026-03-10#remove-a-security-manager-team).",
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
                const response = await octokit.rest.orgs.removeSecurityManagerTeam({
                    org: input.org,
                    team_slug: input.team_slug
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgSecurityManagerTeamSuccess = {
                    success: true,
                    message: "Security manager team removed successfully.",
                    http_status: response.status,
                    org: input.org,
                    team_slug: input.team_slug,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgSecurityManagerTeamFailure = {
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
