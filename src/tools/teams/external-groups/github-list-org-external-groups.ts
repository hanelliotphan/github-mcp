import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { ListOrgExternalGroupsFailure, ListOrgExternalGroupsSuccess } from "../../../types.js";
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

export function registerGithubListOrgExternalGroupsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_external_groups",
        "List external groups available to an organization (GET /orgs/{org}/external-groups). " +
            "Enterprise Managed Users only. Response **`groups`** array is extracted from the API envelope. " +
            "Optional **`display_name`** filter and cursor-style **`page`** token (string). No **`all_pages`**. " +
            "See [List external groups available to an organization](https://docs.github.com/en/enterprise-cloud@latest/rest/teams/external-groups?apiVersion=2026-03-10#list-external-groups-available-to-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            display_name: z.string().optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            page: z.union([z.string().min(1), z.number().int().min(1)]).optional()
        },
        async (input) => {
            try {
                const perPage = input.per_page ?? DEFAULT_PER_PAGE;
                const response = await octokit.request("GET /orgs/{org}/external-groups", {
                    org: input.org,
                    per_page: perPage,
                    ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
                    ...(input.page !== undefined ? { page: input.page } : {})
                } as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const groups = extractGroups(response.data);
                const successPayload: ListOrgExternalGroupsSuccess = {
                    success: true,
                    message: "External groups listed successfully.",
                    org: input.org,
                    groups,
                    per_page: perPage,
                    page: input.page ?? null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgExternalGroupsFailure = {
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
