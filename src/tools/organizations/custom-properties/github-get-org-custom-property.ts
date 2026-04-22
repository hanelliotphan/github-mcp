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

function toPlainProperty(data: unknown): OrgCustomPropertyRow {
    return JSON.parse(JSON.stringify(data)) as OrgCustomPropertyRow;
}

export function registerGithubGetOrgCustomPropertyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_custom_property",
        "Get **one** organization custom property definition by name (GET /orgs/{org}/properties/schema/{custom_property_name}). " +
            "Returns the same fields as list-all (`property_name`, `value_type`, `required`, …). " +
            "Organization **members** can read; **403** / **404** when forbidden or not found. " +
            "See [Get a custom property for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#get-a-custom-property-for-an-organization).",
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
                .describe("Custom property name (path segment; same as `property_name` in the API body).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.customPropertiesForReposGetOrganizationDefinition({
                    org: input.org,
                    custom_property_name: input.custom_property_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const property = toPlainProperty(response.data);
                const successPayload: GetOrgCustomPropertySuccess = {
                    success: true,
                    message: "Organization custom property definition retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    custom_property_name: input.custom_property_name,
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
