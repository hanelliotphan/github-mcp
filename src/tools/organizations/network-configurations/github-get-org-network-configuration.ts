import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgNetworkConfigurationFailure,
    GetOrgNetworkConfigurationSuccess,
    OrgNetworkConfigurationItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainNetworkConfiguration(data: unknown): OrgNetworkConfigurationItem {
    return JSON.parse(JSON.stringify(data)) as OrgNetworkConfigurationItem;
}

export function registerGithubGetOrgNetworkConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_network_configuration",
        "Get one **hosted compute network configuration** for an organization (GET /orgs/{org}/settings/network-configurations/{network_configuration_id}). " +
            "Returns `id`, `name`, `compute_service`, `network_settings_ids`, `failover_network_settings_ids`, `failover_network_enabled`, `created_on`, … per GitHub. " +
            "Classic OAuth apps and PATs need **`read:network_configurations`** scope. **200** on success. " +
            "See [Get a hosted compute network configuration for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#get-a-hosted-compute-network-configuration-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            network_configuration_id: z
                .string()
                .min(1)
                .describe("Unique identifier of the hosted compute network configuration.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/settings/network-configurations/{network_configuration_id}",
                    {
                        org: input.org,
                        network_configuration_id: input.network_configuration_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgNetworkConfigurationSuccess = {
                    success: true,
                    message: "Hosted compute network configuration retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    network_configuration_id: input.network_configuration_id,
                    network_configuration: toPlainNetworkConfiguration(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgNetworkConfigurationFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
