import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgPackageSuccess, DeleteOrgPackageFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const loginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubDeleteOrgPackageTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_package",
        "Delete an entire package in an organization (DELETE /orgs/{org}/packages/{package_type}/{package_name}). Success is HTTP **204**. See [Delete a package for an organization](https://docs.github.com/en/rest/packages/packages?apiVersion=2026-03-10#delete-a-package-for-an-organization).",
        {
            org: z.string().min(1).max(39).regex(loginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            package_type: z.enum(["npm", "maven", "rubygems", "docker", "nuget", "container"]),
            package_name: z.string().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.packages.deletePackageForOrg({ org: input.org, package_type: input.package_type, package_name: input.package_name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgPackageSuccess = {
                    success: true,
                    message: "Organization package deleted successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    package_type: input.package_type,
                    package_name: input.package_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgPackageFailure = {
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
