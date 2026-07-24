import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RestoreUserPackageSuccess, RestoreUserPackageFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubRestoreUserPackageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_restore_user_package",
        "Restore a deleted package for a user (POST /users/{username}/packages/{package_type}/{package_name}/restore). Optional **token**. Success is HTTP **204**. See [Restore a package for a user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#restore-a-package-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(loginRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1),
            token: z.string().min(1).optional().describe("Package restore token.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.restorePackageForUser({ username: input.username, package_type: input.package_type, package_name: input.package_name, ...(input.token !== undefined ? { token: input.token } : {}) });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RestoreUserPackageSuccess = {
                    success: true,
                    message: "User package restored successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RestoreUserPackageFailure = {
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
