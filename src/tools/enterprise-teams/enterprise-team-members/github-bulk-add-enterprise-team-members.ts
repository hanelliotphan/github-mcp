import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    BulkAddEnterpriseTeamMembersFailure,
    BulkAddEnterpriseTeamMembersSuccess
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

export function registerGithubBulkAddEnterpriseTeamMembersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_bulk_add_enterprise_team_members",
        "Bulk add team members to an enterprise team (POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/add). " +
            "Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Bulk add team members](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-members?apiVersion=2026-03-10#bulk-add-team-members).",
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
                const response = await octokit.rest.enterpriseTeamMemberships.bulkAdd({
                    enterprise: input.enterprise,
                    "enterprise-team": input.enterprise_team,
                    usernames: input.usernames
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: BulkAddEnterpriseTeamMembersSuccess = {
                    success: true,
                    message: "Enterprise team members added successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    enterprise_team: input.enterprise_team,
                    usernames: input.usernames,
                    members: toPlainRows(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: BulkAddEnterpriseTeamMembersFailure = {
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
