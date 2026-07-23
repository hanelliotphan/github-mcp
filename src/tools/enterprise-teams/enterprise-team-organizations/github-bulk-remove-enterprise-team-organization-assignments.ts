import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    BulkRemoveEnterpriseTeamOrganizationAssignmentsFailure,
    BulkRemoveEnterpriseTeamOrganizationAssignmentsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubBulkRemoveEnterpriseTeamOrganizationAssignmentsTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_bulk_remove_enterprise_team_organization_assignments",
        "Bulk remove organization assignments from an enterprise team (POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/remove). " +
            "Success is HTTP **204**. Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Remove organization assignments](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-organizations?apiVersion=2026-03-10#remove-organization-assignments).",
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
                const response = await octokit.rest.enterpriseTeamOrganizations.bulkRemove({
                    enterprise: input.enterprise,
                    "enterprise-team": input.enterprise_team,
                    organization_slugs: input.organization_slugs
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: BulkRemoveEnterpriseTeamOrganizationAssignmentsSuccess = {
                    success: true,
                    message: "Organization assignments removed successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    enterprise_team: input.enterprise_team,
                    organization_slugs: input.organization_slugs,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: BulkRemoveEnterpriseTeamOrganizationAssignmentsFailure = {
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
