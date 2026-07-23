import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { ListOrgDependabotSecretsSuccess, ListOrgDependabotSecretsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { DEFAULT_MAX_ALL_PAGES, fetchAllPageLinkPages } from "../../../utils/github-paginate-all.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { getLinkHeaderFromResponse, parseGitHubPageLinkPagination } from "../../../utils/parse-github-link-header.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "secrets" in data) {
        const o = data as Record<string, unknown>;
        return { total_count: typeof o.total_count === "number" ? o.total_count : 0, rows: Array.isArray(o.secrets) ? o.secrets : [] };
    }
    return { total_count: 0, rows: [] };
}
export function registerGithubListOrgDependabotSecretsTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_org_dependabot_secrets", "List Dependabot secrets in an organization (GET /orgs/{org}/dependabot/secrets). Classic tokens need admin:org. See [List organization secrets](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#list-organization-secrets).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        per_page: z.number().int().min(1).max(100).optional(), page: z.number().int().min(1).optional(), all_pages: z.boolean().optional(), max_pages: z.number().int().min(1).max(500).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        try {
            if (input.all_pages === true) {
                const maxPages = input.max_pages ?? DEFAULT_MAX_ALL_PAGES;
                let firstTotalCount: number | undefined;
                const result = await fetchAllPageLinkPages({ perPage, maxPages, fetchPage: async (page, pp) => {
                    const response = await octokit.rest.dependabot.listOrgSecrets({ org: input.org, per_page: pp, page });
                    const parsed = parseBody(response.data);
                    if (firstTotalCount === undefined) firstTotalCount = parsed.total_count;
                    return { rows: parsed.rows, linkHeader: getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string }), requestId: getRequestId(response.headers["x-github-request-id"]) };
                }});
                const secrets = result.rows.map((row) => toPlain(row));
                return textAndData({ success: true, message: "Organization Dependabot secrets listed successfully.", org: input.org, total_count: firstTotalCount ?? secrets.length, secrets, pagination: result.responsePagination, request_id: result.lastRequestId, page: result.lastPage, per_page: perPage, pages_fetched: result.pagesFetched, truncated: result.truncated || undefined } satisfies ListOrgDependabotSecretsSuccess);
            }
            const page = input.page ?? 1;
            const response = await octokit.rest.dependabot.listOrgSecrets({ org: input.org, per_page: perPage, page });
            const parsed = parseBody(response.data);
            return textAndData({ success: true, message: "Organization Dependabot secrets listed successfully.", org: input.org, total_count: parsed.total_count, secrets: parsed.rows.map((row) => toPlain(row)), pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage, pages_fetched: 1 } satisfies ListOrgDependabotSecretsSuccess);
        } catch (error: unknown) {
                const failurePayload: ListOrgDependabotSecretsFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
