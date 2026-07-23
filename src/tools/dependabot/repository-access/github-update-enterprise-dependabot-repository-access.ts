import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { UpdateEnterpriseDependabotRepositoryAccessSuccess, UpdateEnterpriseDependabotRepositoryAccessFailure } from "../../../types.js";
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

export function registerGithubUpdateEnterpriseDependabotRepositoryAccessTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_enterprise_dependabot_repository_access", "Update Dependabot repository access for an enterprise (PATCH /enterprises/{enterprise}/dependabot/repository-access). Returns **204**. See [Updates Dependabot's repository access list for an enterprise](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#updates-dependabots-repository-access-list-for-an-enterprise).", {
        enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
        repository_ids_to_add: z.array(z.number().int().positive()).optional(),
        repository_ids_to_remove: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const response = await octokit.request("PATCH /enterprises/{enterprise}/dependabot/repository-access", { enterprise: input.enterprise, ...(input.repository_ids_to_add !== undefined ? { repository_ids_to_add: input.repository_ids_to_add } : {}), ...(input.repository_ids_to_remove !== undefined ? { repository_ids_to_remove: input.repository_ids_to_remove } : {}) } as never);
            return textAndData({ success: true, message: "Enterprise Dependabot repository access updated successfully.", http_status: response.status, enterprise: input.enterprise, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies UpdateEnterpriseDependabotRepositoryAccessSuccess);
        } catch (error: unknown) {
                const failurePayload: UpdateEnterpriseDependabotRepositoryAccessFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
