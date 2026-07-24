import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetUserPackageSuccess, GetUserPackageFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetUserPackageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_user_package",
        "Get a package for a user (GET /users/{username}/packages/{package_type}/{package_name}). See [Get a package for a user](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#get-a-package-for-a-user).",
        {
            username: z.string().min(1).max(39).regex(loginRegex, "username must be a valid GitHub login (1–39 chars, alphanumeric and hyphens)"),
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.getPackageForUser({ username: input.username, package_type: input.package_type, package_name: input.package_name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetUserPackageSuccess = {
                    success: true,
                    message: "User package retrieved successfully.",
                    http_status: response.status as number,
                    username: input.username,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    package: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetUserPackageFailure = {
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
