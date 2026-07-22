import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckRepoCollaboratorSuccess, CheckRepoCollaboratorFailure } from "../../../types.js";
import { getRequestId, mapGitHubError, isHttpStatus } from "../../../utils/errors.js";
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

export function registerGithubCheckRepoCollaboratorTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_repo_collaborator",
        "Check if a user is a repository collaborator (GET /repos/{owner}/{repo}/collaborators/{username}). Returns 204 when they are a collaborator; on 404 this tool returns is_collaborator: false. Classic tokens need read:org and repo. See [Check if a user is a repository collaborator](https://docs.github.com/en/rest/collaborators/collaborators?apiVersion=2026-03-10#check-if-a-user-is-a-repository-collaborator).",
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
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.checkCollaborator({
                    owner: input.owner,
                    repo: input.name,
                    username: input.username
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckRepoCollaboratorSuccess = {
                    success: true,
                    message: "User is a collaborator on this repository.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    username: input.username,
                    is_collaborator: true,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                if (isHttpStatus(error, 404)) {
                    const successPayload: CheckRepoCollaboratorSuccess = {
                        success: true,
                        message: "GitHub returned 404: user is not a collaborator on this repository (or the resource was not found).",
                        http_status: 404,
                        owner: input.owner,
                        name: input.name,
                        username: input.username,
                        is_collaborator: false,
                        request_id: getRequestId(
                            (error as { response?: { headers?: Record<string, unknown> } }).response
                                ?.headers?.["x-github-request-id"]
                        )
                    };
                    return textAndData(successPayload);
                }
                const failurePayload: CheckRepoCollaboratorFailure = {
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
