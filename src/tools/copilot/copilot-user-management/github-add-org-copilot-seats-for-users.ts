import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AddOrgCopilotSeatsForUsersSuccess, AddOrgCopilotSeatsForUsersFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubAddOrgCopilotSeatsForUsersTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_org_copilot_seats_for_users",
        "Add users to the Copilot subscription for an organization (POST /orgs/{org}/copilot/billing/selected_users). selected_usernames required. Returns HTTP 201 with seats_created. See [Add users to the Copilot subscription for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#add-users-to-the-copilot-subscription-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            selected_usernames: z.array(z.string().min(1)).min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.copilot.addCopilotSeatsForUsers({ org: input.org,
                    selected_usernames: input.selected_usernames });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddOrgCopilotSeatsForUsersSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    selected_usernames: input.selected_usernames,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddOrgCopilotSeatsForUsersFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
