import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgMembershipForUserFailure,
    GetOrgMembershipForUserSuccess,
    OrgMembershipRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainMembership(data: unknown): OrgMembershipRow {
    return JSON.parse(JSON.stringify(data)) as OrgMembershipRow;
}

export function registerGithubGetOrgMembershipForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_membership_for_user",
        "Get a user’s **organization membership** (GET /orgs/{org}/memberships/{username}). " +
            "The JSON includes **`state`** (`active`, `pending`), **`role`** (`admin`, `member`, `billing_manager`), **`user`**, **`organization`**, **`permissions`**, etc., per GitHub. " +
            "The authenticated user must be an **organization member** to call this endpoint. **200** on success; **403**, **404** on errors. " +
            "See [Get organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#get-organization-membership-for-a-user).",
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
                const response = await octokit.request("GET /orgs/{org}/memberships/{username}", {
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgMembershipForUserSuccess = {
                    success: true,
                    message: "Organization membership retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    username: input.username,
                    membership: toPlainMembership(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgMembershipForUserFailure = {
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
