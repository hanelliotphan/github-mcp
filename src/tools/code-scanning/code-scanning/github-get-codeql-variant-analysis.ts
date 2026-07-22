import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCodeqlVariantAnalysisSuccess, GetCodeqlVariantAnalysisFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetCodeqlVariantAnalysisTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_codeql_variant_analysis", "Get a CodeQL variant analysis summary (GET .../variant-analyses/{codeql_variant_analysis_id}). See [Get the summary of a CodeQL variant analysis](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#get-the-summary-of-a-codeql-variant-analysis).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), codeql_variant_analysis_id: z.number().int().positive()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.getVariantAnalysis({ owner: input.owner, repo: input.name, codeql_variant_analysis_id: input.codeql_variant_analysis_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCodeqlVariantAnalysisSuccess = { success: true, message: "Variant analysis retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, codeql_variant_analysis_id: input.codeql_variant_analysis_id, variant_analysis: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCodeqlVariantAnalysisFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
