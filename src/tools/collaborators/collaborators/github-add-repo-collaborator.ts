import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { AddRepoCollaboratorSuccess, AddRepoCollaboratorFailure } from "../../../types.js";
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

export function registerGithubAddRepoCollaboratorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_repo_collaborator",
        "Add a repository collaborator (PUT /repos/{owner}/{repo}/collaborators/{username}). Optional permission (pull|triage|push|maintain|admin or a custom org role name). Returns 201 with an invitation or 204 when updated/already collaborator. See [Add a repository collaborator](https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2026-03-10#add-a-repository-collaborator).",
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
            username: z
                .string()
                .min(1)
                .max(39)
                .regex(usernameRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            permission: z.string().min(1).optional(),
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.addCollaborator({
                    owner: input.owner,
                    repo: input.name,
                    username: input.username,
                    ...(input.permission !== undefined ? { permission: input.permission } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const invited = (response.status as number) === 201;
                const successPayload: AddRepoCollaboratorSuccess = {
                    success: true,
                    message: invited
                        ? "Collaborator invitation created successfully."
                        : "Collaborator added or permission updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    username: input.username,
                    invited,
                    invitation: invited ? toPlain(response.data) : null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddRepoCollaboratorFailure = {
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
