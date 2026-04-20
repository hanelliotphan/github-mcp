import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckOrgBlockedUserFailure, CheckOrgBlockedUserSuccess } from "../../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCheckOrgBlockedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_org_blocked_user",
        "Check whether an organization **blocks** a user (GET /orgs/{org}/blocks/{username}). " +
            "GitHub returns **204** when the user is blocked, **404** when they are not (or for spam accounts), or without **`admin:org`** scope. " +
            "On **404**, this tool returns **`blocked: false`**; treat that as ambiguous if the token may lack org admin. " +
            "See [Check if a user is blocked by an organization](https://docs.github.com/en/rest/orgs/blocking?apiVersion=2026-03-10#check-if-a-user-is-blocked-by-an-organization).",
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
                const response = await octokit.rest.orgs.checkBlockedUser({
                    org: input.org,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckOrgBlockedUserSuccess = {
                    success: true,
                    message: "User is blocked by this organization.",
                    org: input.org,
                    username: input.username,
                    blocked: true,
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckOrgBlockedUserSuccess = {
                        success: true,
                        message:
                            "GitHub returned 404: user is not blocked, account may be spam-flagged, or the token lacks admin:org (same status in each case).",
                        org: input.org,
                        username: input.username,
                        blocked: false,
                        http_status: 404,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                                "x-github-request-id"
                            ]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckOrgBlockedUserFailure = {
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
