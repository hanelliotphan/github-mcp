import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgActionsSecretFailure,
    GetOrgActionsSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubGetOrgActionsSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_actions_secret",
        "Get a single organization GitHub Actions secret without revealing its value (GET /orgs/{org}/actions/secrets/{secret_name}). " +
            "Returns name, timestamps, and **`visibility`**. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). " +
            "See [Get an organization secret](https://docs.github.com/en/rest/actions/secrets?apiVersion=2026-03-10#get-an-organization-secret).",
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
                const response = await octokit.rest.actions.getOrgSecret({
                    org: input.org,
                    secret_name: input.secret_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgActionsSecretSuccess = {
                    success: true,
                    message: "Organization secret retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    secret_name: input.secret_name,
                    secret: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgActionsSecretFailure = {
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
