import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgRoleFailure,
    GetOrgRoleSuccess,
    OrganizationRoleItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainRole(data: unknown): OrganizationRoleItem {
    return JSON.parse(JSON.stringify(data)) as OrganizationRoleItem;
}

export function registerGithubGetOrgRoleTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_role",
        "Get one **organization role** available to an organization (GET /orgs/{org}/organization-roles/{role_id}). " +
            "Returns the role object (`id`, `name`, `description`, `base_role`, `source`, `permissions`, `organization`, `created_at`, `updated_at` per GitHub). " +
            "The authenticated user must be an **org admin** (or hold the `read_organization_custom_org_role` permission); classic OAuth apps and PATs need **`admin:org`** scope. **200** on success; **404**, **422** on errors. " +
            "See [Get an organization role](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#get-an-organization-role).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            role_id: z.number().int().positive().describe("The unique identifier of the role.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "GET /orgs/{org}/organization-roles/{role_id}",
                    {
                        org: input.org,
                        role_id: input.role_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgRoleSuccess = {
                    success: true,
                    message: "Organization role retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    role_id: input.role_id,
                    role: toPlainRole(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgRoleFailure = {
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
