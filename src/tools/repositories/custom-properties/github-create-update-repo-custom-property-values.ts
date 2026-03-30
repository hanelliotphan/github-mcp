import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateUpdateRepoCustomPropertyValuesFailure,
    CreateUpdateRepoCustomPropertyValuesSuccess,
    RepoCustomPropertyValue
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const propertyValueSchema = z.union([z.string(), z.array(z.string()), z.null()]);

const customPropertyEntrySchema = z.object({
    property_name: z.string().min(1).max(255),
    value: propertyValueSchema
});

export function registerGithubCreateUpdateRepoCustomPropertyValuesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_update_repo_custom_property_values",
        "Create or update custom property values for a repository (PATCH /repos/{owner}/{repo}/properties/values). " +
            "Send one or more `{ property_name, value }` entries; use `value: null` to unset a property on the repo. " +
            "Requires repository admin or the fine-grained 'edit custom property values' permission. " +
            "Properties must be defined by the owning organization. " +
            "See GitHub REST docs for repository custom properties.",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            properties: z
                .array(customPropertyEntrySchema)
                .min(1)
                .describe(
                    "At least one custom property update. value may be a string, string array, or null to unset."
                )
        },
        async (input) => {
            try {
                const properties: RepoCustomPropertyValue[] = input.properties.map((p) => ({
                    property_name: p.property_name,
                    value: p.value
                }));

                const response = await octokit.rest.repos.customPropertiesForReposCreateOrUpdateRepositoryValues({
                    owner: input.owner,
                    repo: input.name,
                    properties
                });

                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: CreateUpdateRepoCustomPropertyValuesSuccess = {
                    success: true,
                    message: "Repository custom property values created or updated successfully.",
                    http_status: response.status,
                    properties,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateUpdateRepoCustomPropertyValuesFailure = {
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
