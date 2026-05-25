import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgNetworkConfigurationFailure,
    CreateOrgNetworkConfigurationSuccess,
    OrgNetworkConfigurationItem
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

const createOrgNetworkConfigurationInputSchema = z
    .object({
        org: z
            .string()
            .min(1)
            .max(39)
            .regex(
                orgLoginRegex,
                "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
            ),
        name: z
            .string()
            .regex(
                networkConfigurationNameRegex,
                "name must be 1–100 characters and may only contain letters, digits, '.', '-', and '_'"
            ),
        network_settings_ids: exactlyOneIdSchema,
        compute_service: computeServiceSchema.optional(),
        failover_network_settings_ids: exactlyOneIdSchema.optional(),
        failover_network_enabled: z.boolean().optional()
    })
    .strict();

function toPlainNetworkConfiguration(data: unknown): OrgNetworkConfigurationItem {
    return JSON.parse(JSON.stringify(data)) as OrgNetworkConfigurationItem;
}

export function registerGithubCreateOrgNetworkConfigurationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_network_configuration",
        "Create a **hosted compute network configuration** for an organization (POST /orgs/{org}/settings/network-configurations). " +
            "Requires **`name`** and **`network_settings_ids`** (exactly **one** id). Optional **`compute_service`** (`none`, `actions`), **`failover_network_settings_ids`** (exactly one id), **`failover_network_enabled`**. " +
            "Classic OAuth apps and PATs need **`write:network_configurations`** scope. **201** on success. " +
            "See [Create a hosted compute network configuration for an organization](https://docs.github.com/en/rest/orgs/network-configurations?apiVersion=2026-03-10#create-a-hosted-compute-network-configuration-for-an-organization).",
        {
            org: createOrgNetworkConfigurationInputSchema.shape.org,
            name: createOrgNetworkConfigurationInputSchema.shape.name,
            network_settings_ids: createOrgNetworkConfigurationInputSchema.shape.network_settings_ids,
            compute_service: createOrgNetworkConfigurationInputSchema.shape.compute_service,
            failover_network_settings_ids:
                createOrgNetworkConfigurationInputSchema.shape.failover_network_settings_ids,
            failover_network_enabled: createOrgNetworkConfigurationInputSchema.shape.failover_network_enabled
        },
        async (rawInput) => {
            const parsed = createOrgNetworkConfigurationInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: CreateOrgNetworkConfigurationFailure = {
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
                    name: string;
                    network_settings_ids: string[];
                    compute_service?: z.infer<typeof computeServiceSchema>;
                    failover_network_settings_ids?: string[];
                    failover_network_enabled?: boolean;
                } = {
                    name: input.name,
                    network_settings_ids: input.network_settings_ids
                };
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
                    "POST /orgs/{org}/settings/network-configurations",
                    {
                        org: input.org,
                        ...body
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgNetworkConfigurationSuccess = {
                    success: true,
                    message: "Hosted compute network configuration created successfully.",
                    http_status: response.status,
                    org: input.org,
                    network_configuration: toPlainNetworkConfiguration(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgNetworkConfigurationFailure = {
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
