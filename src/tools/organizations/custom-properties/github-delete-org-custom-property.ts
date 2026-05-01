import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgCustomPropertyFailure, DeleteOrgCustomPropertySuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgCustomPropertyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_custom_property",
        "Remove an organization custom property definition (DELETE /orgs/{org}/properties/schema/{custom_property_name}). " +
            "Success is HTTP **204** No Content. " +
            "Requires org admin or fine-grained **`custom_properties_org_definitions_manager`**. " +
            "See [Remove a custom property for an organization](https://docs.github.com/en/rest/orgs/custom-properties?apiVersion=2026-03-10#remove-a-custom-property-for-an-organization).",
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
                .describe("Custom property name to remove (GitHub path segment).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.customPropertiesForReposDeleteOrganizationDefinition({
                    org: input.org,
                    custom_property_name: input.custom_property_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgCustomPropertySuccess = {
                    success: true,
                    message: "Organization custom property definition removed successfully.",
                    http_status: response.status,
                    org: input.org,
                    custom_property_name: input.custom_property_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgCustomPropertyFailure = {
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
