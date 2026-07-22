import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteCodeScanningAnalysisSuccess, DeleteCodeScanningAnalysisFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubDeleteCodeScanningAnalysisTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_delete_code_scanning_analysis", "Delete a code scanning analysis (DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}). Optional confirm_delete. See [Delete a code scanning analysis from a repository](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#delete-a-code-scanning-analysis-from-a-repository).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), analysis_id: z.number().int().positive(), confirm_delete: z.union([z.string(), z.null()]).optional()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.deleteAnalysis({
                    owner: input.owner, repo: input.name, analysis_id: input.analysis_id,
                    ...(input.confirm_delete !== undefined ? { confirm_delete: input.confirm_delete } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteCodeScanningAnalysisSuccess = { success: true, message: "Code scanning analysis deleted successfully.", http_status: response.status, owner: input.owner, name: input.name, analysis_id: input.analysis_id, deletion: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteCodeScanningAnalysisFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
