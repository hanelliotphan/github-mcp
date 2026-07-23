import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { UpdateOrgDependabotRepositoryAccessSuccess, UpdateOrgDependabotRepositoryAccessFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubUpdateOrgDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_org_dependabot_repository_access", "Update Dependabot repository access for an organization (PATCH /orgs/{org}/dependabot/repository-access). Returns **204**. See [Updates Dependabot's repository access list for an organization](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#updates-dependabots-repository-access-list-for-an-organization).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        repository_ids_to_add: z.array(z.number().int().positive()).optional(),
        repository_ids_to_remove: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.updateRepositoryAccessForOrg({ org: input.org, ...(input.repository_ids_to_add !== undefined ? { repository_ids_to_add: input.repository_ids_to_add } : {}), ...(input.repository_ids_to_remove !== undefined ? { repository_ids_to_remove: input.repository_ids_to_remove } : {}) });
            return textAndData({ success: true, message: "Organization Dependabot repository access updated successfully.", http_status: response.status, org: input.org, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies UpdateOrgDependabotRepositoryAccessSuccess);
        } catch (error: unknown) {
                const failurePayload: UpdateOrgDependabotRepositoryAccessFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
