import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgCustomPropertyFailure,
    GetOrgCustomPropertySuccess,
    OrgCustomPropertyRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const valueTypeSchema = z.enum(["string", "single_select", "multi_select", "true_false", "url"]);

function toPlainProperty(data: unknown): OrgCustomPropertyRow {
    return JSON.parse(JSON.stringify(data)) as OrgCustomPropertyRow;
}

export function registerGithubCreateUpdateOrgCustomPropertyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_update_org_custom_property",
        "Create or update **one** organization custom property definition (PUT /orgs/{org}/properties/schema/{custom_property_name}). " +
            "**`value_type`** is required in the body; optional fields match GitHub (`required`, `default_value`, `description`, `allowed_values` up to **200**, `values_editable_by`, `require_explicit_values`). " +
            "Requires org admin or fine-grained **`custom_properties_org_definitions_manager`**. " +
            "See [Create or update a custom property for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#create-or-update-a-custom-property-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            custom_property_name: z
                .string()
                .min(1)
                .max(255)
                .describe("Custom property name (URL path segment; GitHub `custom_property_name`)."),
            value_type: valueTypeSchema,
            required: z.boolean().optional(),
            default_value: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
            description: z.string().nullable().optional(),
            allowed_values: z.array(z.string()).max(200).nullable().optional(),
            values_editable_by: z
                .union([z.enum(["org_actors", "org_and_repo_actors"]), z.null()])
                .optional(),
            require_explicit_values: z.boolean().optional()
        },
        async (input) => {
            try {
                const { org, custom_property_name, ...body } = input;
                const response = await octokit.rest.orgs.customPropertiesForReposCreateOrUpdateOrganizationDefinition({
                    org,
                    custom_property_name,
                    // GitHub API includes `value_type: "url"`; Octokit types may lag the OpenAPI schema.
                    ...body
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const property = toPlainProperty(response.data);
                const successPayload: GetOrgCustomPropertySuccess = {
                    success: true,
                    message: "Organization custom property definition created or updated successfully.",
                    http_status: response.status,
                    org,
                    custom_property_name,
                    property,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCustomPropertyFailure = {
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
