import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { DeleteAuthenticatedUserSocialAccountsFailure, DeleteAuthenticatedUserSocialAccountsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
export function registerGithubDeleteAuthenticatedUserSocialAccountsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_delete_authenticated_user_social_accounts", "Delete social accounts (DELETE /user/social_accounts). See [docs](https://docs.github.com/en/rest/users/social-accounts?apiVersion=2026-03-10#delete-social-accounts-for-the-authenticated-user).", {
        account_urls: z.array(z.string().url()).min(1).max(20)
    }, async (input) => {
        try {
            const response = await octokit.rest.users.deleteSocialAccountForAuthenticatedUser({ account_urls: input.account_urls });
            const successPayload: DeleteAuthenticatedUserSocialAccountsSuccess = { success: true, message: "Social accounts deleted.", http_status: response.status, request_id: getRequestId(response.headers["x-github-request-id"]) };
            return textAndData(successPayload);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies DeleteAuthenticatedUserSocialAccountsFailure);
        }
    });
}
