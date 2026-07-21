import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateRepoActionsVariableFailure,
    CreateRepoActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubCreateRepoActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_actions_variable",
        "Create a repository GitHub Actions variable you can reference in workflows (POST /repos/{owner}/{repo}/actions/variables). " +
            "Provide **`variable_name`** and **`value`**. " +
            "The authenticated user must have collaborator access; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201**. " +
            "See [Create a repository variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#create-a-repository-variable).",
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
                .regex(variableNameRegex, "variable_name may only contain letters, numbers, and underscores and cannot start with a number"),
            value: z.string().describe("The value of the variable.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.createRepoVariable({
                    owner: input.owner,
                    repo: input.name,
                    name: input.variable_name,
                    value: input.value
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoActionsVariableSuccess = {
                    success: true,
                    message: "Repository variable created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    variable_name: input.variable_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoActionsVariableFailure = {
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
