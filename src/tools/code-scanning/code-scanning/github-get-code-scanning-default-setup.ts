import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetCodeScanningDefaultSetupSuccess, GetCodeScanningDefaultSetupFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubGetCodeScanningDefaultSetupTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_get_code_scanning_default_setup", "Get code scanning default setup (GET /repos/{owner}/{repo}/code-scanning/default-setup). See [Get a code scanning default setup configuration](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#get-a-code-scanning-default-setup-configuration).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.getDefaultSetup({ owner: input.owner, repo: input.name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCodeScanningDefaultSetupSuccess = { success: true, message: "Default setup retrieved successfully.", http_status: response.status, owner: input.owner, name: input.name, setup: toPlain(response.data), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCodeScanningDefaultSetupFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
