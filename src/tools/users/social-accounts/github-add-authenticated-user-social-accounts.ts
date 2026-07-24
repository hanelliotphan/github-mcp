import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { AddAuthenticatedUserSocialAccountsFailure, AddAuthenticatedUserSocialAccountsSuccess, UserSocialAccountRow } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
export function registerGithubAddAuthenticatedUserSocialAccountsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_add_authenticated_user_social_accounts", "Add social accounts (POST /user/social_accounts). See [docs](https://docs.github.com/en/rest/users/social-accounts?apiVersion=2026-03-10#add-social-accounts-for-the-authenticated-user).", {
        account_urls: z.array(z.string().url()).min(1).max(20)
    }, async (input) => {
        try {
            const response = await octokit.rest.users.addSocialAccountForAuthenticatedUser({ account_urls: input.account_urls });
            const rows = Array.isArray(response.data) ? response.data : [];
            const successPayload: AddAuthenticatedUserSocialAccountsSuccess = { success: true, message: "Social accounts added.", http_status: response.status, social_accounts: rows.map(r => JSON.parse(JSON.stringify(r)) as UserSocialAccountRow), request_id: getRequestId(response.headers["x-github-request-id"]) };
            return textAndData(successPayload);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies AddAuthenticatedUserSocialAccountsFailure);
        }
    });
}
