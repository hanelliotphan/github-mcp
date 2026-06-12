import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgSecurityManagerTeamsFailure,
    ListOrgSecurityManagerTeamsSuccess,
    OrgSecurityManagerTeamRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainTeams(rows: unknown[]): OrgSecurityManagerTeamRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrgSecurityManagerTeamRow);
}

export function registerGithubListOrgSecurityManagerTeamsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_security_manager_teams",
        "List **security manager teams** in an organization (GET /orgs/{org}/security-managers). " +
            "Returns **team simple** rows (`id`, `name`, `slug`, `permission`, `description`, …). " +
            "Teams with the security manager role can view security alerts and manage security settings across the org. " +
            "**Deprecation:** GitHub is closing down this API (removal from **January 1, 2026**); prefer **Organization Roles** endpoints instead. " +
            "**200** on success. " +
            "See [List security manager teams](https://docs.github.com/en/rest/orgs/security-managers?apiVersion=2026-03-10#list-security-manager-teams).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.listSecurityManagerTeams({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgSecurityManagerTeamsSuccess = {
                    success: true,
                    message: "Security manager teams listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    teams: toPlainTeams(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgSecurityManagerTeamsFailure = {
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
