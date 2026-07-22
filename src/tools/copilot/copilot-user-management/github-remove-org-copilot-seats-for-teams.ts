import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RemoveOrgCopilotSeatsForTeamsSuccess, RemoveOrgCopilotSeatsForTeamsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubRemoveOrgCopilotSeatsForTeamsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_copilot_seats_for_teams",
        "Remove teams from the Copilot subscription for an organization (DELETE /orgs/{org}/copilot/billing/selected_teams). selected_teams required. Returns seats_cancelled. See [Remove teams from the Copilot subscription for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#remove-teams-from-the-copilot-subscription-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            selected_teams: z.array(z.string().min(1)).min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.copilot.cancelCopilotSeatAssignmentForTeams({ org: input.org,
                    selected_teams: input.selected_teams });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgCopilotSeatsForTeamsSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    selected_teams: input.selected_teams,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgCopilotSeatsForTeamsFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
