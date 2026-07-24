import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetAuthenticatedUserEmailVisibilityFailure,
    SetAuthenticatedUserEmailVisibilitySuccess,
    UserEmailRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainEmails(rows: unknown[]): UserEmailRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as UserEmailRow);
}

export function registerGithubSetAuthenticatedUserEmailVisibilityTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_set_authenticated_user_email_visibility",
        "Set **primary email visibility** for the authenticated user (PATCH /user/email/visibility). " +
            "Requires **`visibility`**: `public` or `private`. Returns updated email list on **200**. " +
            "See [Set primary email visibility for the authenticated user](https://docs.github.com/en/rest/users/emails?apiVersion=2026-03-10#set-primary-email-visibility-for-the-authenticated-user).",
        {
            visibility: z.enum(["public", "private"])
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.setPrimaryEmailVisibilityForAuthenticatedUser({
                    visibility: input.visibility
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: SetAuthenticatedUserEmailVisibilitySuccess = {
                    success: true,
                    message: "Primary email visibility updated successfully.",
                    http_status: response.status,
                    visibility: input.visibility,
                    emails: toPlainEmails(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetAuthenticatedUserEmailVisibilityFailure = {
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
