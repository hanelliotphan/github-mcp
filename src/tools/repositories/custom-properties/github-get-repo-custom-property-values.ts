import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoCustomPropertyValuesFailure,
    GetRepoCustomPropertyValuesSuccess,
    RepoCustomPropertyValue
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toRepoCustomPropertyValue(row: {
    property_name: string;
    value: string | string[] | null;
}): RepoCustomPropertyValue {
    return {
        property_name: row.property_name,
        value: row.value
    };
}

export function registerGithubGetRepoCustomPropertyValuesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_custom_property_values",
        "Get all custom property values set for a repository (GET /repos/{owner}/{repo}/properties/values). " +
            "Returns organization-assigned custom properties for org-owned repos. " +
            "Users with read access to the repository can call this endpoint. " +
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
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.customPropertiesForReposGetRepositoryValues({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const property_values = response.data.map((row) => toRepoCustomPropertyValue(row));

                const successPayload: GetRepoCustomPropertyValuesSuccess = {
                    success: true,
                    message: "Repository custom property values retrieved successfully.",
                    property_values,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoCustomPropertyValuesFailure = {
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
