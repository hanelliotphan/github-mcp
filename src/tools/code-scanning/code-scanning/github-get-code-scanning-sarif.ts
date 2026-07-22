import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCodeScanningSarifSuccess, GetCodeScanningSarifFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetCodeScanningSarifTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_code_scanning_sarif", "Get SARIF upload info (GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}). See [Get information about a SARIF upload](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#get-information-about-a-sarif-upload).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), sarif_id: z.string().min(1)
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.getSarif({ owner: input.owner, repo: input.name, sarif_id: input.sarif_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCodeScanningSarifSuccess = { success: true, message: "SARIF upload status retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, sarif_id: input.sarif_id, status: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCodeScanningSarifFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
