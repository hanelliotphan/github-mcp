import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { RemoveSelectedRepoFromOrgDependabotSecretSuccess, RemoveSelectedRepoFromOrgDependabotSecretFailure } from "../../../types.js";
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

export function registerGithubRemoveSelectedRepoFromOrgDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_remove_selected_repo_from_org_dependabot_secret", "Remove repository from org Dependabot secret (DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}). Returns **204**. See [Remove selected repository from an organization secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#remove-selected-repository-from-an-organization-secret).", {
        org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        repository_id: z.number().int().positive()
    }, async (input) => {
        try {
            const response = await octokit.rest.dependabot.removeSelectedRepoFromOrgSecret({ org: input.org, secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository removed from organization Dependabot secret successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies RemoveSelectedRepoFromOrgDependabotSecretSuccess);
        } catch (error: unknown) {
                const failurePayload: RemoveSelectedRepoFromOrgDependabotSecretFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
