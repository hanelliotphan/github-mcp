import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";

import type { ListAuthenticatedUserDockerMigrationConflictsSuccess, ListAuthenticatedUserDockerMigrationConflictsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubListAuthenticatedUserDockerMigrationConflictsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_authenticated_user_docker_migration_conflicts",
        "List packages that conflict during Docker migration for the authenticated user (GET /user/docker/conflicts). See [Get list of conflicting packages during Docker migration for authenticated-user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#get-list-of-conflicting-packages-during-docker-migration-for-authenticated-user).",
        {},
        async () => {
            try {
                const response = await octokit.rest.packages.listDockerMigrationConflictingPackagesForAuthenticatedUser({});
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListAuthenticatedUserDockerMigrationConflictsSuccess = {
                    success: true,
                    message: "Docker migration conflicts retrieved successfully.",
                    http_status: response.status as number,
                    packages: Array.isArray(response.data) ? toPlainRows(response.data) : [],
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListAuthenticatedUserDockerMigrationConflictsFailure = {
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
