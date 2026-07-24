import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddAuthenticatedUserEmailsFailure,
    AddAuthenticatedUserEmailsSuccess,
    UserEmailRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlainEmails(rows: unknown[]): UserEmailRow[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as UserEmailRow);
}

export function registerGithubAddAuthenticatedUserEmailsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_authenticated_user_emails",
        "Add **email addresses** to the authenticated user (POST /user/emails). Requires **`user`** scope on classic tokens. " +
            "Body requires **`emails`** (one or more addresses). Returns **201** with the updated email list. " +
            "See [Add an email address for the authenticated user](https://docs.github.com/en/rest/users/emails?apiVersion=2026-03-10#add-an-email-address-for-the-authenticated-user).",
        {
            emails: z.array(z.string().email()).min(1).max(20)
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.addEmailForAuthenticatedUser({
                    emails: input.emails
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: AddAuthenticatedUserEmailsSuccess = {
                    success: true,
                    message: "Email addresses added successfully.",
                    http_status: response.status,
                    emails: toPlainEmails(rows),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddAuthenticatedUserEmailsFailure = {
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
