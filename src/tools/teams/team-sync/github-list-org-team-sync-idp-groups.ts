import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgTeamSyncIdpGroupsFailure,
    ListOrgTeamSyncIdpGroupsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const DEFAULT_PER_PAGE = 100 as const;

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
}

function extractGroups(data: unknown): Record<string, unknown>[] {
    if (data && typeof data === "object" && "groups" in data) {
        const rows = (data as { groups?: unknown }).groups;
        return Array.isArray(rows) ? toPlainRows(rows) : [];
    }
    return [];
}

export function registerGithubListOrgTeamSyncIdpGroupsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_team_sync_idp_groups",
        "List IdP groups for an organization (GET /orgs/{org}/team-sync/groups). " +
            "Team synchronization must be enabled. Response **`groups`** array is extracted from the API envelope. " +
            "Optional **`q`** prefix filter, **`per_page`**, and cursor-style **`page`** token (string). No **`all_pages`**. " +
            "See [List IdP groups for an organization](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/team-sync?apiVersion=2026-03-10#list-idp-groups-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            q: z.string().optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const response = await octokit.request("GET /orgs/{org}/team-sync/groups", {
                    org: input.org,
                    per_page: perPage,
                    ...(input.q !== undefined ? { q: input.q } : {}),
                    ...(input.page !== undefined ? { page: input.page } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: ListOrgTeamSyncIdpGroupsSuccess = {
                    success: true,
                    message: "IdP groups listed successfully.",
                    org: input.org,
                    groups: extractGroups(response.data),
                    per_page: perPage,
                    page: input.page ?? null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgTeamSyncIdpGroupsFailure = {
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
