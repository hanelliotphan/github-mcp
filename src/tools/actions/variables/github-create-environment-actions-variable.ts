import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateEnvironmentActionsVariableFailure,
    CreateEnvironmentActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubCreateEnvironmentActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_environment_actions_variable",
        "Create a GitHub Actions variable in a repository environment (POST /repos/{owner}/{repo}/environments/{environment_name}/variables). " +
            "Provide **`variable_name`** and **`value`**. " +
            "The authenticated user must have collaborator access; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201**. " +
            "See [Create an environment variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#create-an-environment-variable).",
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
            environment_name: z.string().min(1).describe("The name of the environment."),
            variable_name: z
                .string()
                .min(1)
                .regex(variableNameRegex, "variable_name may only contain letters, numbers, and underscores and cannot start with a number"),
            value: z.string().describe("The value of the variable.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.createEnvironmentVariable({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name,
                    name: input.variable_name,
                    value: input.value
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateEnvironmentActionsVariableSuccess = {
                    success: true,
                    message: "Environment variable created successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    environment_name: input.environment_name,
                    variable_name: input.variable_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateEnvironmentActionsVariableFailure = {
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
