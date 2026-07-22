import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateCodeScanningDefaultSetupSuccess, UpdateCodeScanningDefaultSetupFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUpdateCodeScanningDefaultSetupTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_update_code_scanning_default_setup", "Update code scanning default setup (PATCH /repos/{owner}/{repo}/code-scanning/default-setup). Returns 200 or 202. See [Update a code scanning default setup configuration](https://docs.github.com/en/rest/code-scanning/code-scanning?apiVersion=2026-03-10#update-a-code-scanning-default-setup-configuration).", {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            state: z.enum(["configured", "not-configured"]).optional(),
            runner_type: z.enum(["standard", "labeled"]).optional(),
            runner_label: z.union([z.string().min(1), z.null()]).optional(),
            query_suite: z.enum(["default", "extended"]).optional(),
            threat_model: z.enum(["remote", "remote_and_local"]).optional(),
            languages: z.array(z.enum(["actions","c-cpp","csharp","go","java-kotlin","javascript-typescript","python","ruby","swift"])).optional()
        }, async (input) => {
            try {
                const response = await octokit.rest.codeScanning.updateDefaultSetup({
                    owner: input.owner, repo: input.name,
                    ...(input.state !== undefined ? { state: input.state } : {}),
                    ...(input.runner_type !== undefined ? { runner_type: input.runner_type } : {}),
                    ...(input.runner_label !== undefined ? { runner_label: input.runner_label } : {}),
                    ...(input.query_suite !== undefined ? { query_suite: input.query_suite } : {}),
                    ...(input.threat_model !== undefined ? { threat_model: input.threat_model } : {}),
                    ...(input.languages !== undefined ? { languages: input.languages } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateCodeScanningDefaultSetupSuccess = { success: true, message: (response.status as number) === 202 ? "Default setup update accepted." : "Default setup updated successfully.", http_status: response.status as number, owner: input.owner, name: input.name, result: toPlain(response.data ?? {}), request_id: requestId };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateCodeScanningDefaultSetupFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        });
}
