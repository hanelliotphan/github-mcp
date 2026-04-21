import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgCustomPropertiesSchemaFailure,
    GetOrgCustomPropertiesSchemaSuccess,
    OrgCustomPropertySchemaRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainPropertyRows(data: unknown): OrgCustomPropertySchemaRow[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return (data as unknown[]).map((row) => JSON.parse(JSON.stringify(row)) as OrgCustomPropertySchemaRow);
}

export function registerGithubGetOrgCustomPropertiesSchemaTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_custom_properties_schema",
        "Get **all custom property definitions** for an organization (GET /orgs/{org}/properties/schema). " +
            "Each item includes **`property_name`**, **`value_type`**, optional **`required`**, **`default_value`**, **`description`**, **`allowed_values`**, etc., per GitHub. " +
            "Organization **members** can read the schema; **403** / **404** when forbidden or not found. " +
            "See [Get all custom properties for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#get-all-custom-properties-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.customPropertiesForReposGetOrganizationDefinitions({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const properties = toPlainPropertyRows(response.data);
                const successPayload: GetOrgCustomPropertiesSchemaSuccess = {
                    success: true,
                    message: "Organization custom property schema retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    properties,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgCustomPropertiesSchemaFailure = {
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
