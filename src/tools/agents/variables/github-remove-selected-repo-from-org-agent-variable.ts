import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveSelectedRepoFromOrgAgentVariableFailure,
    RemoveSelectedRepoFromOrgAgentVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubRemoveSelectedRepoFromOrgAgentVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_selected_repo_from_org_agent_variable",
        "Revoke one repository's access to a `selected`-visibility organization agent variable (DELETE /orgs/{org}/agents/variables/{name}/repositories/{repository_id}). " +
            "Returns HTTP **409** if the variable visibility is not `selected`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Returns HTTP **204** with no content. " +
            "See [Remove selected repository from an organization variable](https://docs.github.com/en/rest/agents/variables?apiVersion=2026-03-10#remove-selected-repository-from-an-organization-variable).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .regex(variableNameRegex, "name may only contain letters, numbers, and underscores and cannot start with a number"),
            repository_id: z.number().int().positive().describe("The unique identifier of the repository to revoke access.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/agents/variables/{name}/repositories/{repository_id}",
                    {
                        org: input.org,
                        name: input.name,
                        repository_id: input.repository_id
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveSelectedRepoFromOrgAgentVariableSuccess = {
                    success: true,
                    message: "Repository removed from organization agent variable successfully.",
                    http_status: response.status,
                    org: input.org,
                    variable_name: input.name,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveSelectedRepoFromOrgAgentVariableFailure = {
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
