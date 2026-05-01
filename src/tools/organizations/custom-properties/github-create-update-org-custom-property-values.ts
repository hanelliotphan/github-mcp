import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateUpdateOrgCustomPropertyValuesFailure,
    CreateUpdateOrgCustomPropertyValuesSuccess,
    RepoCustomPropertyValue
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const propertyValueSchema = z.union([z.string(), z.array(z.string()), z.null()]);

const customPropertyEntrySchema = z.object({
    property_name: z.string().min(1).max(255),
    value: propertyValueSchema
});

export function registerGithubCreateUpdateOrgCustomPropertyValuesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_update_org_custom_property_values",
        "Create or update custom property values for up to **30** org repositories in one request (PATCH /orgs/{org}/properties/values). " +
            "Each repo in **`repository_names`** gets the same **`properties`** map: `{ property_name, value }` with **`value`** a string, string array, or **`null`** to unset. " +
            "Requires org admin or fine-grained **`custom_properties_org_values_editor`**. " +
            "Success is typically HTTP **204** No Content. **422** if validation fails or rate limits apply. " +
            "See [Create or update custom property values for organization repositories](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#create-or-update-custom-property-values-for-organization-repositories).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            repository_names: z
                .array(
                    z
                        .string()
                        .min(1)
                        .max(100)
                        .regex(
                            repoNameRegex,
                            "each name must be 1–100 chars and contain only letters, numbers, '.', '_' or '-'"
                        )
                )
                .min(1)
                .max(30)
                .describe("Short repository names in the org (not owner/repo). GitHub allows at most 30 per request."),
            properties: z
                .array(customPropertyEntrySchema)
                .min(1)
                .describe(
                    "Property updates applied to every listed repository. value may be a string, string array, or null to unset."
                )
        },
        async (input) => {
            try {
                const properties: RepoCustomPropertyValue[] = input.properties.map((p) => ({
                    property_name: p.property_name,
                    value: p.value
                }));

                const response = await octokit.rest.orgs.customPropertiesForReposCreateOrUpdateOrganizationValues({
                    org: input.org,
                    repository_names: input.repository_names,
                    properties
                });

                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateUpdateOrgCustomPropertyValuesSuccess = {
                    success: true,
                    message: "Organization repository custom property values created or updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    repository_names: input.repository_names,
                    properties,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateUpdateOrgCustomPropertyValuesFailure = {
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
