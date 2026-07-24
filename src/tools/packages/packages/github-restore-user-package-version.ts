import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RestoreUserPackageVersionSuccess, RestoreUserPackageVersionFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubRestoreUserPackageVersionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_restore_user_package_version",
        "Restore a package version for a user (POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore). Success is HTTP **204**. See [Restore package version for a user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#restore-package-version-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(loginRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1),
            package_version_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.restorePackageVersionForUser({ username: input.username, package_type: input.package_type, package_name: input.package_name, package_version_id: input.package_version_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RestoreUserPackageVersionSuccess = {
                    success: true,
                    message: "User package version restored successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    package_version_id: input.package_version_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RestoreUserPackageVersionFailure = {
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
