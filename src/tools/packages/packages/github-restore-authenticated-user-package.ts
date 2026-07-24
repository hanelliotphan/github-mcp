import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RestoreAuthenticatedUserPackageSuccess, RestoreAuthenticatedUserPackageFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubRestoreAuthenticatedUserPackageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_restore_authenticated_user_package",
        "Restore a deleted package for the authenticated user (POST /user/packages/{package_type}/{package_name}/restore). Optional **token**. Success is HTTP **204**. See [Restore a package for the authenticated user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#restore-a-package-for-the-authenticated-user).",
        {
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1),
            token: z.string().min(1).optional().describe("Package restore token.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.restorePackageForAuthenticatedUser({ package_type: input.package_type, package_name: input.package_name, ...(input.token !== undefined ? { token: input.token } : {}) });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RestoreAuthenticatedUserPackageSuccess = {
                    success: true,
                    message: "Authenticated user package restored successfully.",
                    http_status: response.status as number,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RestoreAuthenticatedUserPackageFailure = {
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
