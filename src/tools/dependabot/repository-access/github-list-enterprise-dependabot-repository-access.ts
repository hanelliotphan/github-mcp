import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { ListEnterpriseDependabotRepositoryAccessSuccess, ListEnterpriseDependabotRepositoryAccessFailure } from "../../../types.js";
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

export function registerGithubListEnterpriseDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_list_enterprise_dependabot_repository_access", "List repositories Dependabot can access in an enterprise (GET /enterprises/{enterprise}/dependabot/repository-access). Returns default_level and accessible_repositories. Enterprise owner required. See [Lists the repositories Dependabot can access in an enterprise](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#lists-the-repositories-dependabot-can-access-in-an-enterprise).", {
        enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional()
    }, async (input) => {
        const perPage = input.per_page ?? DEFAULT_PER_PAGE;
        const page = input.page ?? 1;
        try {
            const response = await octokit.request("GET /enterprises/{enterprise}/dependabot/repository-access", { enterprise: input.enterprise, per_page: perPage, page } as never);
            const data = toPlain(response.data);
            return textAndData({ success: true, message: "Dependabot repository access listed successfully.", http_status: response.status, enterprise: input.enterprise, default_level: data.default_level ?? null, accessible_repositories: Array.isArray(data.accessible_repositories) ? data.accessible_repositories.map((r) => toPlain(r)) : [], pagination: parseGitHubPageLinkPagination(getLinkHeaderFromResponse(response.headers as { link?: string; Link?: string })), request_id: getRequestId(response.headers["x-github-request-id"]), page, per_page: perPage } satisfies ListEnterpriseDependabotRepositoryAccessSuccess);
        } catch (error: unknown) {
                const failurePayload: ListEnterpriseDependabotRepositoryAccessFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
