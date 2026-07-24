import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListUserDockerMigrationConflictsSuccess, ListUserDockerMigrationConflictsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubListUserDockerMigrationConflictsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_user_docker_migration_conflicts",
        "List packages that conflict during Docker migration for a user (GET /users/{username}/docker/conflicts). See [Get list of conflicting packages during Docker migration for user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#get-list-of-conflicting-packages-during-docker-migration-for-user).",
        {
            username: z.string().min(1).max(39).regex(loginRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.listDockerMigrationConflictingPackagesForUser({ username: input.username });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListUserDockerMigrationConflictsSuccess = {
                    success: true,
                    message: "Docker migration conflicts retrieved successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    packages: Array.isArray(response.data) ? toPlainRows(response.data) : [],
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListUserDockerMigrationConflictsFailure = {
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
