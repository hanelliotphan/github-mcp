import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { SetOrgDependabotRepositoryAccessDefaultLevelSuccess, SetOrgDependabotRepositoryAccessDefaultLevelFailure } from "../../../types.js";
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

export function registerGithubSetOrgDependabotRepositoryAccessDefaultLevelTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_org_dependabot_repository_access_default_level", "Set default Dependabot repository access level for an organization (PUT /orgs/{org}/dependabot/repository-access/default-level). Returns **204**. See [Set the default repository access level for Dependabot](https://docs.github.com/en/rest/dependabot/repository-access?apiVersion=2026-03-10#set-the-default-repository-access-level-for-dependabot).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        default_level: z.enum(["public", "internal"])
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.setRepositoryAccessDefaultLevel({ org: input.org, default_level: input.default_level });
            return textAndData({ success: true, message: "Organization default Dependabot repository access level set successfully.", http_status: response.status, org: input.org, default_level: input.default_level, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetOrgDependabotRepositoryAccessDefaultLevelSuccess);
        } catch (error: unknown) {
                const failurePayload: SetOrgDependabotRepositoryAccessDefaultLevelFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
