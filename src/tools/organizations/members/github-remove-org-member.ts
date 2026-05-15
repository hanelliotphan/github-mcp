import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RemoveOrgMemberFailure, RemoveOrgMemberSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgMemberTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_member",
        "Remove a user from an organization (DELETE /orgs/{org}/members/{username}). " +
            "Removes them from **all teams** and revokes org repo access from **direct** membership. " +
            "If they also have membership via an **enterprise team**, only direct membership is removed per GitHub. " +
            "Success is HTTP **204** No Content. Requires appropriate permissions (typically **org owner**; classic PATs often need **`admin:org`**). **403**, **404**, **451** on errors. " +
            "See [Remove an organization member](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#remove-an-organization-member).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    usernameRegex,
                    "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /orgs/{org}/members/{username}", {
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgMemberSuccess = {
                    success: true,
                    message: "Organization member removed successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgMemberFailure = {
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
