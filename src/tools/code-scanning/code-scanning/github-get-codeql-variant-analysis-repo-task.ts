import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCodeqlVariantAnalysisRepoTaskSuccess, GetCodeqlVariantAnalysisRepoTaskFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetCodeqlVariantAnalysisRepoTaskTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_codeql_variant_analysis_repo_task", "Get variant analysis repo task status (GET .../variant-analyses/{id}/repos/{repo_owner}/{repo_name}). See [Get the analysis status of a repository in a CodeQL variant analysis](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#get-the-analysis-status-of-a-repository-in-a-codeql-variant-analysis).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), codeql_variant_analysis_id: z.number().int().positive(), repo_owner: z.string().min(1).max(39), repo_name: z.string().min(1).max(100)
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.getVariantAnalysisRepoTask({
                    owner: input.owner, repo: input.name, codeql_variant_analysis_id: input.codeql_variant_analysis_id,
                    repo_owner: input.repo_owner, repo_name: input.repo_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCodeqlVariantAnalysisRepoTaskSuccess = { success: true, message: "Variant analysis repo task retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, codeql_variant_analysis_id: input.codeql_variant_analysis_id, repo_owner: input.repo_owner, repo_name: input.repo_name, task: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCodeqlVariantAnalysisRepoTaskFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
