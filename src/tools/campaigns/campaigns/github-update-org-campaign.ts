import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateOrgCampaignFailure, UpdateOrgCampaignSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUpdateOrgCampaignTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_campaign",
        "Update a security campaign (PATCH /orgs/{org}/campaigns/{campaign_number}). " +
            "Requires org owner or security manager; classic tokens need `security_events`. " +
            "Optional: name, description, managers, team_managers, ends_at, contact_link, state. " +
            "See [Update a campaign](https://docs.github.com/en/rest/campaigns/campaigns?apiVersion=2026-03-10#update-a-campaign).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            campaign_number: z.number().int().positive(),
            name: z.string().min(1).max(255).optional(),
            description: z.string().min(1).max(65536).optional(),
            managers: z.array(z.string().min(1)).optional(),
            team_managers: z.array(z.string().min(1)).optional(),
            ends_at: z.string().min(1).optional().describe("ISO 8601 date-time"),
            contact_link: z.union([z.string().url(), z.null()]).optional(),
            state: z.enum(["open", "closed"]).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.campaigns.updateCampaign({
                    org: input.org,
                    campaign_number: input.campaign_number,
                    ...(input.name !== undefined ? { name: input.name } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.managers !== undefined ? { managers: input.managers } : {}),
                    ...(input.team_managers !== undefined ? { team_managers: input.team_managers } : {}),
                    ...(input.ends_at !== undefined ? { ends_at: input.ends_at } : {}),
                    ...(input.contact_link !== undefined ? { contact_link: input.contact_link } : {}),
                    ...(input.state !== undefined ? { state: input.state } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgCampaignSuccess = {
                    success: true,
                    message: "Campaign updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    campaign_number: input.campaign_number,
                    campaign: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgCampaignFailure = {
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
