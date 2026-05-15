import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgMembershipForAuthUserFailure,
    GetOrgMembershipForAuthUserSuccess,
    OrgMembershipRow
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainMembership(data: unknown): OrgMembershipRow {
    return JSON.parse(JSON.stringify(data)) as OrgMembershipRow;
}

export function registerGithubGetOrgMembershipForAuthUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_membership_for_auth_user",
        "Get the authenticated user’s **organization membership** for one org (GET /user/memberships/orgs/{org}). " +
            "Same JSON shape as **`github_get_org_membership_for_user`** (`state`, `role`, `user`, `organization`, `permissions`, …). " +
            "**200** when the token user has an **active** or **pending** membership; **404** if not affiliated; **403** if blocked (e.g. GitHub App). " +
            "See [Get an organization membership for the authenticated user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#get-an-organization-membership-for-the-authenticated-user).",
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
                const response = await octokit.request("GET /user/memberships/orgs/{org}", {
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgMembershipForAuthUserSuccess = {
                    success: true,
                    message: "Organization membership for the authenticated user retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    membership: toPlainMembership(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgMembershipForAuthUserFailure = {
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
