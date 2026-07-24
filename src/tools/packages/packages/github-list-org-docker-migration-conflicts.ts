import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgDockerMigrationConflictsSuccess, ListOrgDockerMigrationConflictsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubListOrgDockerMigrationConflictsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_docker_migration_conflicts",
        "List packages that conflict during Docker migration for an organization (GET /orgs/{org}/docker/conflicts). See [Get list of conflicting packages during Docker migration for organization](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#get-list-of-conflicting-packages-during-docker-migration-for-organization).",
        {
            org: z.string().min(1).max(39).regex(loginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.listDockerMigrationConflictingPackagesForOrganization({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListOrgDockerMigrationConflictsSuccess = {
                    success: true,
                    message: "Docker migration conflicts retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    packages: Array.isArray(response.data) ? toPlainRows(response.data) : [],
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgDockerMigrationConflictsFailure = {
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
