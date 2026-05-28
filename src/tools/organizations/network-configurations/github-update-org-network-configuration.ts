import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgNetworkConfigurationItem,
    UpdateOrgNetworkConfigurationFailure,
    UpdateOrgNetworkConfigurationSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

/** Per GitHub: 1–100 chars; letters, digits, `.`, `-`, `_` only. */
const networkConfigurationNameRegex = /^[A-Za-z0-9._-]{1,100}$/;

const exactlyOneIdSchema = z
    .array(z.string().min(1))
    .length(1, { message: "must contain exactly one identifier per GitHub" });

const computeServiceSchema = z.enum(["none", "actions"]);

const updateOrgNetworkConfigurationInputSchema = z
    .object({
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
            .describe("Unique identifier of the hosted compute network configuration."),
        name: z
            .string()
            .regex(
                networkConfigurationNameRegex,
                "name must be 1–100 characters and may only contain letters, digits, '.', '-', and '_'"
            )
            .optional(),
        network_settings_ids: exactlyOneIdSchema.optional(),
        compute_service: computeServiceSchema.optional(),
        failover_network_settings_ids: exactlyOneIdSchema.optional(),
        failover_network_enabled: z.boolean().optional()
    })
    .strict()
    .refine(
        (input) =>
            input.name !== undefined ||
            input.network_settings_ids !== undefined ||
            input.compute_service !== undefined ||
            input.failover_network_settings_ids !== undefined ||
            input.failover_network_enabled !== undefined,
        {
            message:
                "At least one field to update is required (name, network_settings_ids, compute_service, failover_network_settings_ids, or failover_network_enabled)."
        }
    );

function toPlainNetworkConfiguration(data: unknown): OrgNetworkConfigurationItem {
    return JSON.parse(JSON.stringify(data)) as OrgNetworkConfigurationItem;
}

export function registerGithubUpdateOrgNetworkConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_network_configuration",
        "Update a **hosted compute network configuration** for an organization (PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}). " +
            "Pass at least one of **`name`**, **`network_settings_ids`** (exactly one id), **`compute_service`** (`none`, `actions`), **`failover_network_settings_ids`** (exactly one id), **`failover_network_enabled`**. " +
            "Classic OAuth apps and PATs need **`write:network_configurations`** scope. **200** on success. " +
            "See [Update a hosted compute network configuration for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#update-a-hosted-compute-network-configuration-for-an-organization).",
        {
            org: updateOrgNetworkConfigurationInputSchema.shape.org,
            network_configuration_id: updateOrgNetworkConfigurationInputSchema.shape.network_configuration_id,
            name: updateOrgNetworkConfigurationInputSchema.shape.name,
            network_settings_ids: updateOrgNetworkConfigurationInputSchema.shape.network_settings_ids,
            compute_service: updateOrgNetworkConfigurationInputSchema.shape.compute_service,
            failover_network_settings_ids:
                updateOrgNetworkConfigurationInputSchema.shape.failover_network_settings_ids,
            failover_network_enabled: updateOrgNetworkConfigurationInputSchema.shape.failover_network_enabled
        },
        async (rawInput) => {
            const parsed = updateOrgNetworkConfigurationInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: UpdateOrgNetworkConfigurationFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: parsed.error.issues.map((i) => i.message).join("; "),
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            const input = parsed.data;
            try {
                const body: {
                    name?: string;
                    network_settings_ids?: string[];
                    compute_service?: z.infer<typeof computeServiceSchema>;
                    failover_network_settings_ids?: string[];
                    failover_network_enabled?: boolean;
                } = {};
                if (input.name !== undefined) {
                    body.name = input.name;
                }
                if (input.network_settings_ids !== undefined) {
                    body.network_settings_ids = input.network_settings_ids;
                }
                if (input.compute_service !== undefined) {
                    body.compute_service = input.compute_service;
                }
                if (input.failover_network_settings_ids !== undefined) {
                    body.failover_network_settings_ids = input.failover_network_settings_ids;
                }
                if (input.failover_network_enabled !== undefined) {
                    body.failover_network_enabled = input.failover_network_enabled;
                }

                const response = await octokit.request(
                    "PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}",
                    {
                        org: input.org,
                        network_configuration_id: input.network_configuration_id,
                        ...body
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgNetworkConfigurationSuccess = {
                    success: true,
                    message: "Hosted compute network configuration updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    network_configuration_id: input.network_configuration_id,
                    network_configuration: toPlainNetworkConfiguration(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgNetworkConfigurationFailure = {
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
