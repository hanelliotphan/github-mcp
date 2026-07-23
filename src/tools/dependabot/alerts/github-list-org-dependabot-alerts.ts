import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { ListOrgDependabotAlertsSuccess, ListOrgDependabotAlertsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllCursorLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubLinkPagination } from "../../../utils/parse-github-link-header.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubListOrgDependabotAlertsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_org_dependabot_alerts", "List Dependabot alerts for an organization (GET /orgs/{org}/dependabot/alerts). Optional filters; cursor pagination via before/after. Classic tokens need security_events. See [List Dependabot alerts for an organization](https://docs.github.com/en/rest/dependabot/alerts?apiVersion=2026-03-10#list-dependabot-alerts-for-an-organization).", {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
classification: z.string().min(1).optional(),
            state: z.string().min(1).optional(),
            severity: z.string().min(1).optional(),
            ecosystem: z.string().min(1).optional(),
            package: z.string().min(1).optional(),
            epss_percentage: z.string().min(1).optional(),
            has: z.string().min(1).optional(),
            assignee: z.string().min(1).optional(),
            scope: z.enum(["development", "runtime"]).optional(),
            sort: z.enum(["created", "updated", "epss_percentage"]).optional(),
            direction: z.enum(["asc", "desc"]).optional(),
            per_page: z.number().int().min(1).max(100).optional(),
            before: z.string().min(1).optional(),
            after: z.string().min(1).optional(),
            all_pages: z.boolean().optional(),
            max_pages: z.number().int().min(1).max(500).optional(),
            artifact_registry_url: z.string().min(1).optional(),
            artifact_registry: z.string().min(1).optional(),
            runtime_risk: z.string().min(1).optional()
        }, async (input) => {
            const perPage = input.per_page ?? DEFAULT_PER_PAGE;
            const filters = {
                ...(input.classification !== undefined ? { classification: input.classification } : {}),
                ...(input.state !== undefined ? { state: input.state } : {}),
                ...(input.severity !== undefined ? { severity: input.severity } : {}),
                ...(input.ecosystem !== undefined ? { ecosystem: input.ecosystem } : {}),
                ...(input.package !== undefined ? { package: input.package } : {}),
                ...(input.epss_percentage !== undefined ? { epss_percentage: input.epss_percentage } : {}),
                ...(input.has !== undefined ? { has: input.has } : {}),
                ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
                ...(input.scope !== undefined ? { scope: input.scope } : {}),
                ...(input.sort !== undefined ? { sort: input.sort } : {}),
                ...(input.direction !== undefined ? { direction: input.direction } : {}),
                ...(input.artifact_registry_url !== undefined ? { artifact_registry_url: input.artifact_registry_url } : {}),
                ...(input.artifact_registry !== undefined ? { artifact_registry: input.artifact_registry } : {}),
                ...(input.runtime_risk !== undefined ? { runtime_risk: input.runtime_risk } : {})
            };
            try {
                if (input.all_pages === true) {
                    const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                    const result = await fetchAllCursorLinkPages({
                        maxPages,
                        initialAfter: input.after,
                        initialBefore: input.before,
                        fetchChunk: async (cursors) => {
                            const response = await octokit.rest.dependabot.listAlertsForOrg({ org: input.org, per_page: perPage, ...filters, ...(cursors.after ? { after: cursors.after } : {}), ...(cursors.before ? { before: cursors.before } : {}) });
                            return { rows: Array.isArray(response.data) ? response.data : [], linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                        }
                    });
                    const alerts = result.rows.map((row) => toPlain(row));
                    const successPayload: ListOrgDependabotAlertsSuccess = {
                        success: true,
                        message: result.truncated ? `Dependabot alerts partially listed (${result.pagesFetched} pages, ${alerts.length} alerts); more pages exist.` : result.pagesFetched > 1 ? `Dependabot alerts retrieved successfully (${result.pagesFetched} pages, ${alerts.length} alerts).` : "Dependabot alerts retrieved successfully.",
                        org: input.org,
                        alerts,
                        pagination: result.responsePagination,
                        request_id: result.lastRequestId,
                        per_page: perPage,
                        pages_fetched: result.pagesFetched,
                        truncated: result.truncated || undefined
                    };
                    return textAndData(successPayload);
                }
                const response = await octokit.rest.dependabot.listAlertsForOrg({ org: input.org, per_page: perPage, ...filters, ...(input.after !== undefined ? { after: input.after } : {}), ...(input.before !== undefined ? { before: input.before } : {}) });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const rows = Array.isArray(response.data) ? response.data : [];
                const successPayload: ListOrgDependabotAlertsSuccess = {
                    success: true,
                    message: "Dependabot alerts retrieved successfully.",
                    org: input.org,
                    alerts: rows.map((row) => toPlain(row)),
                    pagination: parseGitHubLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })),
                    request_id: requestId,
                    per_page: perPage,
                    pages_fetched: 1
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgDependabotAlertsFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
        });
}
