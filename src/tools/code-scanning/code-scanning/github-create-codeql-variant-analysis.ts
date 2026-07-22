import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateCodeqlVariantAnalysisSuccess, CreateCodeqlVariantAnalysisFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCreateCodeqlVariantAnalysisTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_codeql_variant_analysis", "Create a CodeQL variant analysis (POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses). See [Create a CodeQL variant analysis](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#create-a-codeql-variant-analysis).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), language: z.enum(["cpp","csharp","go","java","javascript","python","ruby","rust","swift"]), query_pack: z.string().min(1),
            repositories: z.array(z.string().min(1)).optional(),
            repository_lists: z.array(z.string().min(1)).optional(),
            repository_owners: z.array(z.string().min(1)).optional()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.createVariantAnalysis({
                    owner: input.owner, repo: input.name, language: input.language, query_pack: input.query_pack,
                    ...(input.repositories !== undefined ? { repositories: input.repositories } : {}),
                    ...(input.repository_lists !== undefined ? { repository_lists: input.repository_lists } : {}),
                    ...(input.repository_owners !== undefined ? { repository_owners: input.repository_owners } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateCodeqlVariantAnalysisSuccess = { success: true, message: "Variant analysis created successfully.", http_status: response.status, owner: input.owner, name: input.name, variant_analysis: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateCodeqlVariantAnalysisFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
