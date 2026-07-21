import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgActionsSecretFailure,
    DeleteOrgActionsSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubDeleteOrgActionsSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_actions_secret",
        "Delete an organization GitHub Actions secret by name (DELETE /orgs/{org}/actions/secrets/{secret_name}). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Success is HTTP **204**. " +
            "See [Delete an organization secret](https://docs.github.com/en/rest/actions/secrets?apiVersion=2026-03-10#delete-an-organization-secret).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.deleteOrgSecret({
                    org: input.org,
                    secret_name: input.secret_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgActionsSecretSuccess = {
                    success: true,
                    message: "Organization secret deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    secret_name: input.secret_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgActionsSecretFailure = {
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
