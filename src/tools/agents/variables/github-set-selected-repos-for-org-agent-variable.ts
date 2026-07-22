import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetSelectedReposForOrgAgentVariableFailure,
    SetSelectedReposForOrgAgentVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubSetSelectedReposForOrgAgentVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_selected_repos_for_org_agent_variable",
        "Replace the full set of repositories that can access a `selected`-visibility organization agent variable (PUT /orgs/{org}/agents/variables/{name}/repositories). " +
            "Provide **`selected_repository_ids`** (the complete desired list). Returns HTTP **409** if the variable visibility is not `selected`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Returns HTTP **204** with no content. " +
            "See [Set selected repositories for an organization variable](https://docs.github.com/en/rest/agents/variables?apiVersion=2026-03-10#set-selected-repositories-for-an-organization-variable).",
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
            selected_repository_ids: z
                .array(z.number().int().positive())
                .describe("The IDs of the repositories that can access the organization variable.")
        },
        async (input) => {
            try {
                const response = await octokit.request("PUT /orgs/{org}/agents/variables/{name}/repositories", {
                    org: input.org,
                    name: input.name,
                    selected_repository_ids: input.selected_repository_ids
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetSelectedReposForOrgAgentVariableSuccess = {
                    success: true,
                    message: "Selected repositories set successfully.",
                    http_status: response.status,
                    org: input.org,
                    variable_name: input.name,
                    selected_repository_ids: input.selected_repository_ids,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetSelectedReposForOrgAgentVariableFailure = {
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
