import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AcceptRepositoryInvitationSuccess, AcceptRepositoryInvitationFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubAcceptRepositoryInvitationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_accept_repository_invitation",
        "Accept a repository invitation (PATCH /user/repository_invitations/{invitation_id}). See [Accept a repository invitation](https://docs.github.com/en/rest/collaborators/invitations?apiVersion=2026-03-10#accept-a-repository-invitation).",
        {
            invitation_id: z.number().int().positive(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.acceptInvitationForAuthenticatedUser({
                    invitation_id: input.invitation_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AcceptRepositoryInvitationSuccess = {
                    success: true,
                    message: "Repository invitation accepted successfully.",
                    http_status: response.status as number,
                    invitation_id: input.invitation_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AcceptRepositoryInvitationFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }

        }
    );
}
