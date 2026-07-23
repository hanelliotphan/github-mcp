import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteEnterpriseTeamFailure, DeleteEnterpriseTeamSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

export function registerGithubDeleteEnterpriseTeamTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_enterprise_team",
        "Delete an enterprise team (DELETE /enterprises/{enterprise}/teams/{team_slug}). " +
            "Success is HTTP **204**. Requires a classic PAT only (`read:enterprise` for GET, `admin:enterprise` for writes); not compatible with fine-grained PATs or GitHub App tokens. " +
            "See [Delete an enterprise team](https://docs.github.com/en/rest/enterprise-teams/enterprise-teams?apiVersion=2026-03-10#delete-an-enterprise-team).",
        {
            enterprise: z
                .string()
                .min(1)
                .max(50)
                .regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
            team_slug: z.string().min(1).describe("The slug of the enterprise team.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.enterpriseTeams.delete({
                    enterprise: input.enterprise,
                    team_slug: input.team_slug
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteEnterpriseTeamSuccess = {
                    success: true,
                    message: "Enterprise team deleted successfully.",
                    http_status: response.status as number,
                    enterprise: input.enterprise,
                    team_slug: input.team_slug,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteEnterpriseTeamFailure = {
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
