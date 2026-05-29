import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgRolesFailure,
    ListOrgRolesSuccess,
    OrganizationRoleItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseRolesBody(data: unknown): { total_count: number; roles: unknown[] } {
    if (data && typeof data === "object" && "roles" in data) {
        const o = data as Record<string, unknown>;
        const roles = Array.isArray(o.roles) ? o.roles : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : roles.length;
        return { total_count, roles };
    }
    return { total_count: 0, roles: [] };
}

function toPlainRoles(rows: unknown[]): OrganizationRoleItem[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as OrganizationRoleItem);
}

export function registerGithubListOrgRolesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_roles",
        "List **organization roles** available in an organization (GET /orgs/{org}/organization-roles). " +
            "Returns **`total_count`** and **`roles`** (each with `id`, `name`, `description`, `base_role`, `source`, `permissions`, `organization`, `created_at`, `updated_at` per GitHub). " +
            "The authenticated user must be an **org admin** (or hold the `read_organization_custom_org_role` permission); classic OAuth apps and PATs need **`admin:org`** scope. **200** on success; **404**, **422** on errors. " +
            "See [Get all organization roles for an organization](https://docs.github.com/en/rest/orgs/organization-roles?apiVersion=2026-03-10#get-all-organization-roles-for-an-organization).",
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
                const response = await octokit.request("GET /orgs/{org}/organization-roles", {
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseRolesBody(response.data);
                const successPayload: ListOrgRolesSuccess = {
                    success: true,
                    message: "Organization roles listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: parsed.total_count,
                    roles: toPlainRoles(parsed.roles),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgRolesFailure = {
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
