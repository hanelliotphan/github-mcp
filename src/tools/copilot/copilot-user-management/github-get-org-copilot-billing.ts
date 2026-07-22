import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgCopilotBillingSuccess, GetOrgCopilotBillingFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgCopilotBillingTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_copilot_billing",
        "Get Copilot seat information and settings for an organization (GET /orgs/{org}/copilot/billing). Public preview. Returns seat_breakdown and feature policies. See [Get Copilot seat information and settings for an organization](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2026-03-10#get-copilot-seat-information-and-settings-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.copilot.getCopilotOrganizationDetails({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgCopilotBillingSuccess = {
                    success: true,
                    message: "Request completed successfully.",
                    org: input.org,
                    billing: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCopilotBillingFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
