import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteEnterpriseTeamOrganizationAssignmentFailure,
    DeleteEnterpriseTeamOrganizationAssignmentSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteEnterpriseTeamOrganizationAssignmentTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_delete_enterprise_team_organization_assignment",
        "Delete an organization assignment from an enterprise team (DELETE /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}). " +
            "Success is HTTP **204**. Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Delete an organization assignment](https://docs.github.com/en/rest/enterprise-teams/enterprise-team-organizations?apiVersion=2026-03-10#delete-an-organization-assignment).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(50)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
            enterprise_team: z.string().min(1).describe("Enterprise team slug or ID."),
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
                const response = await octokit.rest.enterpriseTeamOrganizations.delete({
                    enterprise: input.enterprise,
                    "enterprise-team": input.enterprise_team,
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteEnterpriseTeamOrganizationAssignmentSuccess = {
                    success: true,
                    message: "Organization assignment deleted successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    enterprise_team: input.enterprise_team,
                    org: input.org,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteEnterpriseTeamOrganizationAssignmentFailure = {
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
