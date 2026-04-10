import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetOrgFailure, GetOrgSuccess, OrganizationDetailItem } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainOrganization(data: unknown): OrganizationDetailItem {
    return JSON.parse(JSON.stringify(data)) as OrganizationDetailItem;
}

export function registerGithubGetOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org",
        "Get a GitHub organization by login (GET /orgs/{org}). " +
            "Returns public org fields for any org; **full** details (billing, private flags, etc.) require appropriate access—classic tokens often need **`admin:org`**, and fine-grained tokens need org permissions as GitHub documents. " +
            "See [Get an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#get-an-organization).",
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
                const response = await octokit.rest.orgs.get({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: GetOrgSuccess = {
                    success: true,
                    message: "Organization retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    organization: toPlainOrganization(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgFailure = {
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
