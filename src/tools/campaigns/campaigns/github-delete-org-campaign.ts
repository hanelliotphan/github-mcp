import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgCampaignFailure, DeleteOrgCampaignSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgCampaignTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_campaign",
        "Delete a security campaign for an organization (DELETE /orgs/{org}/campaigns/{campaign_number}). " +
            "Requires org owner or security manager; classic tokens need `security_events`. Returns **204** on success. " +
            "See [Delete a campaign for an organization](https://docs.github.com/en/rest/campaigns/campaigns?apiVersion=2026-03-10#delete-a-campaign-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            campaign_number: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.campaigns.deleteCampaign({
                    org: input.org,
                    campaign_number: input.campaign_number
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgCampaignSuccess = {
                    success: true,
                    message: "Campaign deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    campaign_number: input.campaign_number,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgCampaignFailure = {
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
