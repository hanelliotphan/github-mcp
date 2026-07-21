import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddSelectedRepoToOrgActionsVariableFailure,
    AddSelectedRepoToOrgActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubAddSelectedRepoToOrgActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_selected_repo_to_org_actions_variable",
        "Grant one repository access to a `selected`-visibility organization variable (PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}). " +
            "Returns HTTP **409** if the variable visibility is not `selected`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Returns HTTP **204** with no content. " +
            "See [Add selected repository to an organization variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#add-selected-repository-to-an-organization-variable).",
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
            repository_id: z.number().int().positive().describe("The unique identifier of the repository to grant access.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.addSelectedRepoToOrgVariable({
                    org: input.org,
                    name: input.name,
                    repository_id: input.repository_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddSelectedRepoToOrgActionsVariableSuccess = {
                    success: true,
                    message: "Repository added to organization variable successfully.",
                    http_status: response.status,
                    org: input.org,
                    variable_name: input.name,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddSelectedRepoToOrgActionsVariableFailure = {
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
