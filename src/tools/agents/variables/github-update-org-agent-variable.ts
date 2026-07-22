import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateOrgAgentVariableFailure,
    UpdateOrgAgentVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubUpdateOrgAgentVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_agent_variable",
        "Update an organization GitHub Agents variable (PATCH /orgs/{org}/agents/variables/{name}). " +
            "Identify the variable by **`name`**; optionally change its **`value`**, **`visibility`** (`all`, `private`, `selected`), and **`selected_repository_ids`**. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Returns HTTP **204** with no content. " +
            "See [Update an organization variable](https://docs.github.com/en/rest/agents/variables?apiVersion=2026-03-10#update-an-organization-variable).",
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
            value: z.string().optional().describe("The new value of the variable."),
            visibility: z
                .enum(["all", "private", "selected"])
                .optional()
                .describe("Which repositories can access the variable. Use `selected` with selected_repository_ids."),
            selected_repository_ids: z
                .array(z.number().int().positive())
                .optional()
                .describe("Repository IDs that can access the variable (only when visibility is `selected`).")
        },
        async (input) => {
            try {
                const response = await octokit.request("PATCH /orgs/{org}/agents/variables/{name}", {
                    org: input.org,
                    name: input.name,
                    ...(input.value !== undefined ? { value: input.value } : {}),
                    ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
                    ...(input.selected_repository_ids !== undefined
                        ? { selected_repository_ids: input.selected_repository_ids }
                        : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgAgentVariableSuccess = {
                    success: true,
                    message: "Organization agent variable updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    variable_name: input.name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgAgentVariableFailure = {
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
