import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgNetworkSettingsFailure,
    GetOrgNetworkSettingsSuccess,
    OrgNetworkSettingsItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainNetworkSettings(data: unknown): OrgNetworkSettingsItem {
    return JSON.parse(JSON.stringify(data)) as OrgNetworkSettingsItem;
}

export function registerGithubGetOrgNetworkSettingsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_network_settings",
        "Get a **hosted compute network settings** resource for an organization (GET /orgs/{org}/settings/network-settings/{network_settings_id}). " +
            "Returns `id`, `name`, `subnet_id`, `region`, optional `network_configuration_id`, … per GitHub. " +
            "Use the id when creating or updating **`github_create_org_network_configuration`** / **`github_update_org_network_configuration`** (`network_settings_ids`). " +
            "Classic OAuth apps and PATs need **`read:network_configurations`** scope. **200** on success. " +
            "See [Get a hosted compute network settings resource for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#get-a-hosted-compute-network-settings-resource-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            network_settings_id: z
                .string()
                .min(1)
                .describe("Unique identifier of the hosted compute network settings resource.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/settings/network-settings/{network_settings_id}",
                    {
                        org: input.org,
                        network_settings_id: input.network_settings_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgNetworkSettingsSuccess = {
                    success: true,
                    message: "Hosted compute network settings retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    network_settings_id: input.network_settings_id,
                    network_settings: toPlainNetworkSettings(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgNetworkSettingsFailure = {
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
