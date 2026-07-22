import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteCodeqlDatabaseSuccess, DeleteCodeqlDatabaseFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubDeleteCodeqlDatabaseTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_delete_codeql_database", "Delete a CodeQL database (DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}). See [Delete a CodeQL database](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#delete-a-codeql-database).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), language: z.string().min(1)
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.deleteCodeqlDatabase({ owner: input.owner, repo: input.name, language: input.language });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteCodeqlDatabaseSuccess = { success: true, message: "CodeQL database deleted successfully.", http_status: response.status, owner: input.owner, name: input.name, language: input.language, request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteCodeqlDatabaseFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
