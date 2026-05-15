import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgMembershipRow,
    UpdateOrgMembershipForAuthUserFailure,
    UpdateOrgMembershipForAuthUserSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainMembership(data: unknown): OrgMembershipRow {
    return JSON.parse(JSON.stringify(data)) as OrgMembershipRow;
}

export function registerGithubUpdateOrgMembershipForAuthUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_membership_for_auth_user",
        "Accept a **pending** organization invitation: set membership to **active** (PATCH /user/memberships/orgs/{org} with **`state`: `active`**). " +
            "GitHub only accepts **`active`**; the authenticated user must have a **pending** invite from **`org`**. " +
            "Returns the updated **Org Membership** object (same shape as **`github_get_org_membership_for_auth_user`**). " +
            "**200** on success; **403**, **404**, **422** on errors. " +
            "See [Update an organization membership for the authenticated user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#update-an-organization-membership-for-the-authenticated-user).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.request("PATCH /user/memberships/orgs/{org}", {
                    org: input.org,
                    state: "active"
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgMembershipForAuthUserSuccess = {
                    success: true,
                    message: "Organization membership for the authenticated user updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    membership: toPlainMembership(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgMembershipForAuthUserFailure = {
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
