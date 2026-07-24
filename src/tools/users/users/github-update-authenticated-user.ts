import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateAuthenticatedUserFailure, UpdateAuthenticatedUserSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateAuthenticatedUserTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_authenticated_user",
        "Update the authenticated user (PATCH /user). Private email settings are still enforced if email is private. " +
            "See [Update the authenticated user](https://docs.github.com/en/rest/users/users?apiVersion=2026-03-10#update-the-authenticated-user).",
        {
            name: z.string().optional(),
            email: z.string().email().optional(),
            blog: z.string().optional(),
            twitter_username: z.string().nullable().optional(),
            company: z.string().optional(),
            location: z.string().optional(),
            hireable: z.boolean().optional(),
            bio: z.string().optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.users.updateAuthenticated({
                    ...(input.name !== undefined ? { name: input.name } : {}),
                    ...(input.email !== undefined ? { email: input.email } : {}),
                    ...(input.blog !== undefined ? { blog: input.blog } : {}),
                    ...(input.twitter_username !== undefined
                        ? { twitter_username: input.twitter_username }
                        : {}),
                    ...(input.company !== undefined ? { company: input.company } : {}),
                    ...(input.location !== undefined ? { location: input.location } : {}),
                    ...(input.hireable !== undefined ? { hireable: input.hireable } : {}),
                    ...(input.bio !== undefined ? { bio: input.bio } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateAuthenticatedUserSuccess = {
                    success: true,
                    message: "Authenticated user updated successfully.",
                    http_status: response.status,
                    user: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateAuthenticatedUserFailure = {
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
