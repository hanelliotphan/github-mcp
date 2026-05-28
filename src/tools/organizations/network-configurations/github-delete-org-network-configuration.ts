import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgNetworkConfigurationFailure,
    DeleteOrgNetworkConfigurationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgNetworkConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_network_configuration",
        "Delete a **hosted compute network configuration** from an organization (DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}). " +
            "Success is HTTP **204** No Content. " +
            "Classic OAuth apps and PATs need **`write:network_configurations`** scope. " +
            "See [Delete a hosted compute network configuration from an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#delete-a-hosted-compute-network-configuration-from-an-organization).",
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
                .describe("Unique identifier of the hosted compute network configuration to delete.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}",
                    {
                        org: input.org,
                        network_configuration_id: input.network_configuration_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgNetworkConfigurationSuccess = {
                    success: true,
                    message: "Hosted compute network configuration deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    network_configuration_id: input.network_configuration_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgNetworkConfigurationFailure = {
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
