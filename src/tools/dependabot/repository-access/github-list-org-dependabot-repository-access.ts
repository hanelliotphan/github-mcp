import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { ListOrgDependabotRepositoryAccessSuccess, ListOrgDependabotRepositoryAccessFailure } from "../../../types.js";
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

export function registerGithubListOrgDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_org_dependabot_repository_access", "List repositories Dependabot can access in an organization (GET /orgs/{org}/dependabot/repository-access). Returns default_level and accessible_repositories. See [Lists the repositories Dependabot can access in an organization](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#lists-the-repositories-dependabot-can-access-in-an-organization).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        const page = input.page ?? 1;
        try {
            const response = await octokit.rest.dependabot.repositoryAccessForOrg({ org: input.org, per_page: perPage, page });
            const data = toPlain(response.data);
            return textAndData({ success: true, message: "Dependabot repository access listed successfully.", http_status: response.status, org: input.org, default_level: data.default_level ?? null, accessible_repositories: Array.isArray(data.accessible_repositories) ? data.accessible_repositories.map((r) => toPlain(r)) : [], pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage } satisfies ListOrgDependabotRepositoryAccessSuccess);
        } catch (error: unknown) {
                const failurePayload: ListOrgDependabotRepositoryAccessFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
