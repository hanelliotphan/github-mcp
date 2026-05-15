import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckOrgPublicMembershipForUserFailure,
    CheckOrgPublicMembershipForUserSuccess
} from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCheckOrgPublicMembershipForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_org_public_membership_for_user",
        "Check whether a user is a **public** member of an organization (GET /orgs/{org}/public_members/{username}). " +
            "GitHub returns **204** when **`username`** has publicized their membership; **404** when they are not a public member. " +
            "See [Check public organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#check-public-organization-membership-for-a-user).",
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
                const response = await octokit.request("GET /orgs/{org}/public_members/{username}", {
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckOrgPublicMembershipForUserSuccess = {
                    success: true,
                    message: "User is a public member of this organization (HTTP 204).",
                    org: input.org,
                    username: input.username,
                    http_status: response.status,
                    is_public_member: true,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckOrgPublicMembershipForUserSuccess = {
                        success: true,
                        message: "User is not a public member of this organization (HTTP 404).",
                        org: input.org,
                        username: input.username,
                        http_status: 404,
                        is_public_member: false,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckOrgPublicMembershipForUserFailure = {
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
