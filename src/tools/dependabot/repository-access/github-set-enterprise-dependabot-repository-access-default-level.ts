import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess, SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure } from "../../../types.js";
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

export function registerGithubSetEnterpriseDependabotRepositoryAccessDefaultLevelTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_enterprise_dependabot_repository_access_default_level", "Set default Dependabot repository access level for an enterprise (PUT /enterprises/{enterprise}/dependabot/repository-access/default-level). Returns **204**. See [Set the default repository access level for Dependabot in an enterprise](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#set-the-default-repository-access-level-for-dependabot-in-an-enterprise).", {
        enterprise: z.string().min(1).max(50).regex(enterpriseSlugRegex, "enterprise must be a valid enterprise slug"),
        default_level: z.enum(["public", "internal"])
    }, async (input) => {
        try {
            const response = await octokit.request("PUT /enterprises/{enterprise}/dependabot/repository-access/default-level", { enterprise: input.enterprise, default_level: input.default_level } as never);
            return textAndData({ success: true, message: "Enterprise default Dependabot repository access level set successfully.", http_status: response.status, enterprise: input.enterprise, default_level: input.default_level, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetEnterpriseDependabotRepositoryAccessDefaultLevelSuccess);
        } catch (error: unknown) {
                const failurePayload: SetEnterpriseDependabotRepositoryAccessDefaultLevelFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
