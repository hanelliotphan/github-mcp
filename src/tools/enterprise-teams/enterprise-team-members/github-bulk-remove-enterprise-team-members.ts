import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    BulkRemoveEnterpriseTeamMembersFailure,
    BulkRemoveEnterpriseTeamMembersSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubBulkRemoveEnterpriseTeamMembersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_bulk_remove_enterprise_team_members",
        "Bulk remove team members from an enterprise team (POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/remove). " +
            "Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Bulk remove team members](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-members?apiVersion=2026-03-10#bulk-remove-team-members).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(50)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
            enterprise_team: z.string().min(1).describe("Enterprise team slug or ID."),
            usernames: z
                .array(
                    z
                        .string()
                        .min(1)
                        .max(39)
                        .regex(
                            loginRegex,
                            "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                        )
                )
                .min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.enterpriseTeamMemberships.bulkRemove({
                    enterprise: input.enterprise,
                    "enterprise-team": input.enterprise_team,
                    usernames: input.usernames
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: BulkRemoveEnterpriseTeamMembersSuccess = {
                    success: true,
                    message: "Enterprise team members removed successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    enterprise_team: input.enterprise_team,
                    usernames: input.usernames,
                    members: toPlainRows(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: BulkRemoveEnterpriseTeamMembersFailure = {
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
