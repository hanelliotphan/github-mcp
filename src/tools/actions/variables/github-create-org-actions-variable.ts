import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgActionsVariableFailure,
    CreateOrgActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubCreateOrgActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_actions_variable",
        "Create an organization GitHub Actions variable you can reference in workflows (POST /orgs/{org}/actions/variables). " +
            "Provide **`name`**, **`value`**, and **`visibility`** (`all`, `private`, or `selected`); when `selected`, pass **`selected_repository_ids`**. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Returns HTTP **201**. " +
            "See [Create an organization variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#create-an-organization-variable).",
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
            value: z.string().describe("The value of the variable."),
            visibility: z
                .enum(["all", "private", "selected"])
                .describe("Which repositories can access the variable. Use `selected` with selected_repository_ids."),
            selected_repository_ids: z
                .array(z.number().int().positive())
                .optional()
                .describe("Repository IDs that can access the variable (only when visibility is `selected`).")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.createOrgVariable({
                    org: input.org,
                    name: input.name,
                    value: input.value,
                    visibility: input.visibility,
                    ...(input.selected_repository_ids !== undefined
                        ? { selected_repository_ids: input.selected_repository_ids }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgActionsVariableSuccess = {
                    success: true,
                    message: "Organization variable created successfully.",
                    http_status: response.status,
                    org: input.org,
                    variable_name: input.name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgActionsVariableFailure = {
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
