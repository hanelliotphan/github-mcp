import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetSelectedReposForOrgCodespacesSecretFailure,
    SetSelectedReposForOrgCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubSetSelectedReposForOrgCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_set_selected_repos_for_org_codespaces_secret", "Set selected repositories for organization codespaces secret. See GitHub REST organization secrets.", { org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"), secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), selected_repository_ids: z.array(z.number().int().positive()) }, async (input) => {
        try {
            const response = await octokit.request("PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories", { org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids });
            return textAndData({ success: true, message: "Selected repositories set successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, selected_repository_ids: input.selected_repository_ids, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies SetSelectedReposForOrgCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies SetSelectedReposForOrgCodespacesSecretFailure);
        }
    });
}