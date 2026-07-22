import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoInvitationSuccess, UpdateRepoInvitationFailure } from "../../../types.js";
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

export function registerGithubUpdateRepoInvitationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_invitation",
        "Update a repository invitation (PATCH /repos/{owner}/{repo}/invitations/{invitation_id}). Optional permissions (read|write|maintain|triage|admin). See [Update a repository invitation](https://docs.github.com/en/rest/collaborators/invitations?apiVersion=2026-03-10#update-a-repository-invitation).",
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
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            invitation_id: z.number().int().positive(),
            permissions: z.enum(["read", "write", "maintain", "triage", "admin"]).optional(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateInvitation({
                    owner: input.owner,
                    repo: input.name,
                    invitation_id: input.invitation_id,
                    ...(input.permissions !== undefined ? { permissions: input.permissions } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoInvitationSuccess = {
                    success: true,
                    message: "Repository invitation updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    invitation_id: input.invitation_id,
                    invitation: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoInvitationFailure = {
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
