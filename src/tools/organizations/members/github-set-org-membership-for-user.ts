import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgMembershipRow,
    SetOrgMembershipForUserFailure,
    SetOrgMembershipForUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const membershipRoleSchema = z.enum(["admin", "member"]);

function toPlainMembership(data: unknown): OrgMembershipRow {
    return JSON.parse(JSON.stringify(data)) as OrgMembershipRow;
}

export function registerGithubSetOrgMembershipForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_membership_for_user",
        "Set or update **organization membership** for a user (PUT /orgs/{org}/memberships/{username}). " +
            "Only **organization owners** may call this. Body **`role`**: **`member`** (GitHub default when omitted) or **`admin`**. " +
            "Adding a user sends an invitation email; **`state`** may be **`pending`** until they accept. Updating to **`admin`** notifies the user; demoting an owner to **`member`** sends no email per GitHub. " +
            "Invitation rate limits apply (50/24h for new orgs, 500/24h for older or paid plans per GitHub). **200** returns the same membership shape as GET. **403**, **422**, **451** on errors. " +
            "See [Set organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#set-organization-membership-for-a-user).",
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
                ),
            role: membershipRoleSchema
                .optional()
                .describe("Organization role: member (GitHub default) or admin (owner).")
        },
        async (input) => {
            try {
                const role = input.role ?? "member";
                const response = await octokit.request("PUT /orgs/{org}/memberships/{username}", {
                    org: input.org,
                    username: input.username,
                    role
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetOrgMembershipForUserSuccess = {
                    success: true,
                    message: "Organization membership set successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    membership: toPlainMembership(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgMembershipForUserFailure = {
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
