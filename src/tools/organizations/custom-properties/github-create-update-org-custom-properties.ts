import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgCustomPropertiesFailure,
    GetOrgCustomPropertiesSuccess,
    OrgCustomPropertyRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const valueTypeSchema = z.enum(["string", "single_select", "multi_select", "true_false", "url"]);

const orgCustomPropertyDefinitionSchema = z
    .object({
        property_name: z.string().min(1).max(255),
        value_type: valueTypeSchema,
        url: z.string().optional(),
        source_type: z.enum(["organization", "enterprise"]).optional(),
        required: z.boolean().optional(),
        default_value: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
        description: z.string().nullable().optional(),
        allowed_values: z.array(z.string()).max(200).nullable().optional(),
        values_editable_by: z
            .union([z.enum(["org_actors", "org_and_repo_actors"]), z.null()])
            .optional(),
        require_explicit_values: z.boolean().optional()
    })
    .strict();

function toPlainPropertyRows(data: unknown): OrgCustomPropertyRow[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return (data as unknown[]).map((row) => JSON.parse(JSON.stringify(row)) as OrgCustomPropertyRow);
}

export function registerGithubCreateUpdateOrgCustomPropertiesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_update_org_custom_properties",
        "Create or update **multiple** organization custom property definitions in one request (PATCH /orgs/{org}/properties/schema). " +
            "Each entry needs **`property_name`** and **`value_type`**; optional fields match GitHub (`required`, `default_value`, `description`, `allowed_values` up to **200**, `values_editable_by`, `require_explicit_values`, `source_type`, `url`). " +
            "Omitted optional fields may reset to GitHub defaults (e.g. `values_editable_by` can revert to **`org_actors`**). " +
            "Requires org admin or fine-grained **`custom_properties_org_definitions_manager`**. " +
            "See [Create or update custom properties for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#create-or-update-custom-properties-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            properties: z
                .array(orgCustomPropertyDefinitionSchema)
                .min(1)
                .describe("Batch of property definitions to create or replace (GitHub request body `properties`).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.customPropertiesForReposCreateOrUpdateOrganizationDefinitions({
                    org: input.org,
                    // GitHub API includes `value_type: "url"`; Octokit types may lag the OpenAPI schema.
                    properties: input.properties as never
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const properties = toPlainPropertyRows(response.data);
                const successPayload: GetOrgCustomPropertiesSuccess = {
                    success: true,
                    message: "Organization custom property definitions created or updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    properties,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCustomPropertiesFailure = {
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
