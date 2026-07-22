import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateOrgCampaignFailure, CreateOrgCampaignSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCreateOrgCampaignTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_campaign",
        "Create a security campaign for an organization (POST /orgs/{org}/campaigns). " +
            "Requires org owner or security manager; classic tokens need `security_events`. " +
            "Required: `name`, `description`, `ends_at`. Optional: managers, team_managers, contact_link, code_scanning_alerts, generate_issues. " +
            "See [Create a campaign for an organization](https://docs.github.com/en/rest/campaigns/campaigns?apiVersion=2026-03-10#create-a-campaign-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z.string().min(1).max(255),
            description: z.string().min(1).max(65536),
            ends_at: z.string().min(1).describe("ISO 8601 date-time; must be in the future"),
            managers: z.array(z.string().min(1)).optional(),
            team_managers: z.array(z.string().min(1)).optional(),
            contact_link: z.union([z.string().url(), z.null()]).optional(),
            code_scanning_alerts: z
                .union([
                    z.array(
                        z.object({
                            repository_id: z.number().int().positive(),
                            alert_numbers: z.array(z.number().int().positive()).min(1)
                        })
                    ),
                    z.null()
                ])
                .optional(),
            generate_issues: z.boolean().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.campaigns.createCampaign({
                    org: input.org,
                    name: input.name,
                    description: input.description,
                    ends_at: input.ends_at,
                    ...(input.managers !== undefined ? { managers: input.managers } : {}),
                    ...(input.team_managers !== undefined ? { team_managers: input.team_managers } : {}),
                    ...(input.contact_link !== undefined ? { contact_link: input.contact_link } : {}),
                    ...(input.code_scanning_alerts !== undefined
                        ? { code_scanning_alerts: input.code_scanning_alerts }
                        : {}),
                    ...(input.generate_issues !== undefined
                        ? { generate_issues: input.generate_issues }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgCampaignSuccess = {
                    success: true,
                    message: "Campaign created successfully.",
                    http_status: response.status,
                    org: input.org,
                    campaign: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgCampaignFailure = {
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
