import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteRepoActionsVariableFailure,
    DeleteRepoActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubDeleteRepoActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_actions_variable",
        "Delete a repository GitHub Actions variable by name (DELETE /repos/{owner}/{repo}/actions/variables/{name}). " +
            "The authenticated user must have collaborator access; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **204** with no content. " +
            "See [Delete a repository variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#delete-a-repository-variable).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            variable_name: z
                .string()
                .min(1)
                .regex(variableNameRegex, "variable_name may only contain letters, numbers, and underscores and cannot start with a number")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.deleteRepoVariable({
                    owner: input.owner,
                    repo: input.name,
                    name: input.variable_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoActionsVariableSuccess = {
                    success: true,
                    message: "Repository variable deleted successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    variable_name: input.variable_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoActionsVariableFailure = {
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
