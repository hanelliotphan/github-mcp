import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppInstallationItem,
    GetOrgInstallationForAuthenticatedAppFailure,
    GetOrgInstallationForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): AppInstallationItem {
    return JSON.parse(JSON.stringify(data)) as AppInstallationItem;
}

export function registerGithubGetOrgInstallationForAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_installation_for_authenticated_app",
        "Get the authenticated GitHub App's installation for an organization (GET /orgs/{org}/installation). " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get an organization installation for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#get-an-organization-installation-for-the-authenticated-app).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.apps.getOrgInstallation({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgInstallationForAuthenticatedAppSuccess = {
                    success: true,
                    message: "Organization installation retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    installation: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgInstallationForAuthenticatedAppFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
