import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotSeatDetailsForUserSuccess, GetOrgCopilotSeatDetailsForUserFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCopilotSeatDetailsForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_seat_details_for_user",
        "Get Copilot seat assignment details for a user (GET /orgs/{org}/members/{username}/copilot). Public preview. See [Get Copilot seat assignment details for a user](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#get-copilot-seat-assignment-details-for-a-user).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            username: z.string().min(1).max(39)
        },
        async (input) => {
            try {
                const response = await octokit.rest.copilot.getCopilotSeatDetailsForUser({ org: input.org,
                    username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotSeatDetailsForUserSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    org: input.org,
                    username: input.username,
                    seat: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotSeatDetailsForUserFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
