import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetAuthenticatedUserPackageVersionSuccess, GetAuthenticatedUserPackageVersionFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetAuthenticatedUserPackageVersionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_authenticated_user_package_version",
        "Get a package version for the authenticated user (GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}). See [Get a package version for the authenticated user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#get-a-package-version-for-the-authenticated-user).",
        {
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1),
            package_version_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.getPackageVersionForAuthenticatedUser({ package_type: input.package_type, package_name: input.package_name, package_version_id: input.package_version_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAuthenticatedUserPackageVersionSuccess = {
                    success: true,
                    message: "Authenticated user package version retrieved successfully.",
                    http_status: response.status as number,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    package_version_id: input.package_version_id,
                    version: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAuthenticatedUserPackageVersionFailure = {
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
