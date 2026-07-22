import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCodeScanningAlertSuccess, GetCodeScanningAlertFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetCodeScanningAlertTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_code_scanning_alert", "Get a code scanning alert (GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}). See [Get a code scanning alert](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#get-a-code-scanning-alert).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), alert_number: z.number().int().positive()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.getAlert({ owner: input.owner, repo: input.name, alert_number: input.alert_number });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCodeScanningAlertSuccess = { success: true, message: "Code scanning alert retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, alert_number: input.alert_number, alert: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCodeScanningAlertFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
