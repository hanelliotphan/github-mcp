import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveSelectedRepoFromOrgCodespacesSecretFailure,
    RemoveSelectedRepoFromOrgCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubRemoveSelectedRepoFromOrgCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_remove_selected_repo_from_org_codespaces_secret", "Remove repository from organization codespaces secret. See GitHub REST organization secrets.", { org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"), secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), repository_id: z.number().int().positive() }, async (input) => {
        try {
            const response = await octokit.request("DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}", { org: input.org, secret_name: input.secret_name, repository_id: input.repository_id });
            return textAndData({ success: true, message: "Repository removed from organization codespaces secret successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, repository_id: input.repository_id, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies RemoveSelectedRepoFromOrgCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies RemoveSelectedRepoFromOrgCodespacesSecretFailure);
        }
    });
}