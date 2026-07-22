import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CheckRepoIsStarredByAuthenticatedUserFailure,
    CheckRepoIsStarredByAuthenticatedUserSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

export function registerGithubCheckRepoIsStarredByAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_repo_is_starred_by_authenticated_user",
        "Check whether the authenticated user has starred a repository (GET /user/starred/{owner}/{repo}). " +
            "GitHub returns HTTP 204 when starred and 404 when not; this tool maps both to a boolean **`starred`** field. " +
            "See [Check if a repository is starred by the authenticated user](https://docs.github.com/en/rest/activity/starring?apiVersion=2026-03-10#check-if-a-repository-is-starred-by-the-authenticated-user).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckRepoIsStarredByAuthenticatedUserSuccess = {
                    success: true,
                    message: "Repository is starred by the authenticated user.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    starred: true,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const status = (error as { status?: number; response?: { status?: number } }).status ??
                    (error as { response?: { status?: number } }).response?.status;
                const requestId = getRequestId(
                    (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                        "x-github-request-id"
                    ]
                );
                if (status === 404) {
                    const successPayload: CheckRepoIsStarredByAuthenticatedUserSuccess = {
                        success: true,
                        message: "Repository is not starred by the authenticated user.",
                        http_status: 404,
                        owner: input.owner,
                        repo: input.name,
                        full_name,
                        starred: false,
                        request_id: requestId
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckRepoIsStarredByAuthenticatedUserFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: requestId
                };
                return textAndData(failurePayload);
            }
        }
    );
}
