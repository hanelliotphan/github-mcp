import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteAuthenticatedUserEmailsFailure, DeleteAuthenticatedUserEmailsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

export function registerGithubDeleteAuthenticatedUserEmailsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_authenticated_user_emails",
        "Delete **email addresses** from the authenticated user (DELETE /user/emails). Requires **`user`** scope on classic tokens. " +
            "Body requires **`emails`** (addresses to remove). Returns **204** on success. " +
            "See [Delete an email address for the authenticated user](https://docs.github.com/en/rest/users/emails?apiVersion=2026-03-10#delete-an-email-address-for-the-authenticated-user).",
        {
            emails: z.array(z.string().email()).min(1).max(20)
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.deleteEmailForAuthenticatedUser({
                    emails: input.emails
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteAuthenticatedUserEmailsSuccess = {
                    success: true,
                    message: "Email addresses deleted successfully.",
                    http_status: response.status,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteAuthenticatedUserEmailsFailure = {
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
