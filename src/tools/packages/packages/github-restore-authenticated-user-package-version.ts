import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RestoreAuthenticatedUserPackageVersionSuccess, RestoreAuthenticatedUserPackageVersionFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubRestoreAuthenticatedUserPackageVersionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_restore_authenticated_user_package_version",
        "Restore a package version for the authenticated user (POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore). Success is HTTP **204**. See [Restore a package version for the authenticated user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#restore-a-package-version-for-the-authenticated-user).",
        {
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1),
            package_version_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.restorePackageVersionForAuthenticatedUser({ package_type: input.package_type, package_name: input.package_name, package_version_id: input.package_version_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RestoreAuthenticatedUserPackageVersionSuccess = {
                    success: true,
                    message: "Authenticated user package version restored successfully.",
                    http_status: response.status as number,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    package_version_id: input.package_version_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RestoreAuthenticatedUserPackageVersionFailure = {
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
