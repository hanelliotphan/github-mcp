import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemovePublicOrgMembershipForAuthUserFailure,
    RemovePublicOrgMembershipForAuthUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemovePublicOrgMembershipForAuthUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_public_org_membership_for_auth_user",
        "Remove **public** organization membership for the **authenticated user** (DELETE /orgs/{org}/public_members/{username}). " +
            "**`username`** must match the token’s GitHub account per GitHub. " +
            "No effect if the org enforces public visibility by default. Success is HTTP **204** No Content. " +
            "See [Remove public organization membership for the authenticated user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#remove-public-organization-membership-for-the-authenticated-user).",
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
                    "username must be the authenticated user’s GitHub login (same as the token account)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /orgs/{org}/public_members/{username}", {
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemovePublicOrgMembershipForAuthUserSuccess = {
                    success: true,
                    message: "Public organization membership removed successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemovePublicOrgMembershipForAuthUserFailure = {
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
