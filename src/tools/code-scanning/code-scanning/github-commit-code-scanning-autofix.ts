import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CommitCodeScanningAutofixSuccess, CommitCodeScanningAutofixFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubCommitCodeScanningAutofixTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_commit_code_scanning_autofix", "Commit an autofix for a code scanning alert (POST .../autofix/commits). See [Commit an autofix for a code scanning alert](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#commit-an-autofix-for-a-code-scanning-alert).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), alert_number: z.number().int().positive(), target_ref: z.string().min(1).optional(), message: z.string().min(1).optional()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.commitAutofix({
                    owner: input.owner, repo: input.name, alert_number: input.alert_number,
                    ...(input.target_ref !== undefined || input.message !== undefined
                        ? { target_ref: input.target_ref, message: input.message }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CommitCodeScanningAutofixSuccess = { success: true, message: "Autofix committed successfully.", http_status: response.status, owner: input.owner, name: input.name, alert_number: input.alert_number, commit: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CommitCodeScanningAutofixFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
