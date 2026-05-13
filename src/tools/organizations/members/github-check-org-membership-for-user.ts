import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckOrgMembershipForUserFailure,
    CheckOrgMembershipForUserSuccess
} from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function getLocationHeader(headers: Record<string, unknown> | undefined): string | null {
    if (headers == null) {
        return null;
    }
    const loc = headers.location ?? headers.Location;
    if (typeof loc === "string" && loc.length > 0) {
        return loc;
    }
    return null;
}

export function registerGithubCheckOrgMembershipForUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_org_membership_for_user",
        "Check whether a user is a **member** of an organization (GET /orgs/{org}/members/{username}). " +
            "Uses **`redirect: manual`** so **302** is visible: GitHub returns **204** when the authenticated user is an org member and **`username`** is a member; **404** when the authenticated user is an org member and **`username`** is not; **302** when the authenticated user is **not** an org member (GitHub does not disclose whether **`username`** is a member). " +
            "See [Check organization membership for a user](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#check-organization-membership-for-a-user).",
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
                const response = await octokit.request("GET /orgs/{org}/members/{username}", {
                    org: input.org,
                    username: input.username,
                    request: { redirect: "manual" }
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const headers = response.headers as Record<string, unknown>;
                const status = response.status as number;

                if (status === 204) {
                    const successPayload: CheckOrgMembershipForUserSuccess = {
                        success: true,
                        message: "User is a member of this organization (HTTP 204).",
                        org: input.org,
                        username: input.username,
                        http_status: 204,
                        is_member: true,
                        location: null,
                        request_id: requestId
                    };
                    return textAndData(successPayload);
                }

                if (status === 302) {
                    const successPayload: CheckOrgMembershipForUserSuccess = {
                        success: true,
                        message:
                            "GitHub returned HTTP 302: the authenticated user is not an organization member, so whether the given user is a member is not disclosed.",
                        org: input.org,
                        username: input.username,
                        http_status: 302,
                        is_member: null,
                        location: getLocationHeader(headers),
                        request_id: requestId
                    };
                    return textAndData(successPayload);
                }

                const failurePayload: CheckOrgMembershipForUserFailure = {
                    success: false,
                    error: {
                        status_code: status,
                        error_type: "github_api_error",
                        message: `Unexpected HTTP status from GET /orgs/{org}/members/{username}: ${status}.`,
                        retryable: false
                    },
                    request_id: requestId
                };
                return textAndData(failurePayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckOrgMembershipForUserSuccess = {
                        success: true,
                        message:
                            "GitHub returned HTTP 404: the authenticated user is an organization member and the given user is not a member (or see GitHub docs for other 404 cases).",
                        org: input.org,
                        username: input.username,
                        http_status: 404,
                        is_member: false,
                        location: null,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckOrgMembershipForUserFailure = {
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
