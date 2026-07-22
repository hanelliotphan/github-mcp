import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UploadCodeScanningSarifSuccess, UploadCodeScanningSarifFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUploadCodeScanningSarifTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_upload_code_scanning_sarif", "Upload SARIF analysis data (POST /repos/{owner}/{repo}/code-scanning/sarifs). sarif must be gzip+base64. See [Upload an analysis as SARIF data](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#upload-an-analysis-as-sarif-data).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), commit_sha: z.string().min(1).max(64), ref: z.string().min(1), sarif: z.string().min(1),
            checkout_uri: z.string().optional(), started_at: z.string().optional(), tool_name: z.string().optional(), validate: z.boolean().optional()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.uploadSarif({
                    owner: input.owner, repo: input.name, commit_sha: input.commit_sha, ref: input.ref, sarif: input.sarif,
                    ...(input.checkout_uri !== undefined ? { checkout_uri: input.checkout_uri } : {}),
                    ...(input.started_at !== undefined ? { started_at: input.started_at } : {}),
                    ...(input.tool_name !== undefined ? { tool_name: input.tool_name } : {}),
                    ...(input.validate !== undefined ? { validate: input.validate } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UploadCodeScanningSarifSuccess = { success: true, message: "SARIF upload accepted.", http_status: response.status, owner: input.owner, name: input.name, receipt: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UploadCodeScanningSarifFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
