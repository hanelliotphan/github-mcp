import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgActionsVariableFailure,
    GetOrgActionsVariableSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const variableNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubGetOrgActionsVariableTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_actions_variable",
        "Get a single organization GitHub Actions variable (GET /orgs/{org}/actions/variables/{name}). " +
            "Returns name, value, timestamps, and visibility. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). " +
            "See [Get an organization variable](https://docs.github.com/en/rest/actions/variables?apiVersion=2026-03-10#get-an-organization-variable).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .regex(variableNameRegex, "name may only contain letters, numbers, and underscores and cannot start with a number")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getOrgVariable({
                    org: input.org,
                    name: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgActionsVariableSuccess = {
                    success: true,
                    message: "Organization variable retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    variable_name: input.name,
                    variable: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgActionsVariableFailure = {
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
