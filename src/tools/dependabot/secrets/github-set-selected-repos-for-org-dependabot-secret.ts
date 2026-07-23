import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { SetSelectedReposForOrgDependabotSecretSuccess, SetSelectedReposForOrgDependabotSecretFailure } from "../../../types.js";
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

export function registerGithubSetSelectedReposForOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_selected_repos_for_org_dependabot_secret", "Set selected repositories for org Dependabot secret (PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories). Returns **204**. See [Set selected repositories for an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#set-selected-repositories-for-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        selected_repository_ids: z.array(z.number().int().positive())
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.setSelectedReposForOrgSecret({ org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids });
            return textAndData({ success: true, message: "Selected repositories set successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetSelectedReposForOrgDependabotSecretSuccess);
        } catch (error: unknown) {
                const failurePayload: SetSelectedReposForOrgDependabotSecretFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
