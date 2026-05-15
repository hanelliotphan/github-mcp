import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveOrgMembershipForUserFailure,
    RemoveOrgMembershipForUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubRemoveOrgMembershipForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_org_membership_for_user",
        "Remove a user’s **organization membership** or cancel a **pending invitation** (DELETE /orgs/{org}/memberships/{username}). " +
            "This is the **memberships** API (not `DELETE /orgs/{org}/members/{username}`). " +
            "If the user is an active member they are removed; if invited, the invitation is canceled; the user is emailed per GitHub. " +
            "Enterprise-team **indirect** membership may remain. Success is HTTP **204** No Content. Requires **organization owner**. **403**, **404** on errors. " +
            "See [Remove organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#remove-organization-membership-for-a-user).",
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
                const response = await octokit.request("DELETE /orgs/{org}/memberships/{username}", {
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveOrgMembershipForUserSuccess = {
                    success: true,
                    message: "Organization membership removed or invitation canceled successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveOrgMembershipForUserFailure = {
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
