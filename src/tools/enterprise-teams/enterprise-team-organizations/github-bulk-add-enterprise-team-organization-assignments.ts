import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    BulkAddEnterpriseTeamOrganizationAssignmentsFailure,
    BulkAddEnterpriseTeamOrganizationAssignmentsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubBulkAddEnterpriseTeamOrganizationAssignmentsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_bulk_add_enterprise_team_organization_assignments",
        "Bulk add organization assignments for an enterprise team (POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/add). " +
            "Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Add organization assignments](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-organizations?apiVersion=2026-03-10#add-organization-assignments).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(50)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
            enterprise_team: z.string().min(1).describe("Enterprise team slug or ID."),
            organization_slugs: z
                .array(
                    z
                        .string()
                        .min(1)
                        .max(39)
                        .regex(
                            orgLoginRegex,
                            "organization slug must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                        )
                )
                .min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.enterpriseTeamOrganizations.bulkAdd({
                    enterprise: input.enterprise,
                    "enterprise-team": input.enterprise_team,
                    organization_slugs: input.organization_slugs
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: BulkAddEnterpriseTeamOrganizationAssignmentsSuccess = {
                    success: true,
                    message: "Organization assignments added successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    enterprise_team: input.enterprise_team,
                    organization_slugs: input.organization_slugs,
                    organizations: toPlainRows(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: BulkAddEnterpriseTeamOrganizationAssignmentsFailure = {
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
