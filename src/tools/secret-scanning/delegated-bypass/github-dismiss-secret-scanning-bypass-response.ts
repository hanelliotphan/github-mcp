import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DismissSecretScanningBypassResponseSuccess, DismissSecretScanningBypassResponseFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}


export function registerGithubDismissSecretScanningBypassResponseTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_dismiss_secret_scanning_bypass_response",
        "Dismiss a response on a secret scanning bypass request (DELETE /repos/{owner}/{repo}/bypass-responses/secret-scanning/{bypass_response_id}). Returns HTTP **204**. Classic tokens need security_events. See [Dismiss a response on a bypass request for secret scanning](https://docs.github.com/en/enterprise-cloud@latest/rest/secret-scanning/delegated-bypass?apiVersion=2026-03-10#dismiss-a-response-on-a-bypass-request-for-secret-scanning).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            bypass_response_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /repos/{owner}/{repo}/bypass-responses/secret-scanning/{bypass_response_id}",
                    { owner: input.owner, repo: input.name, bypass_response_id: input.bypass_response_id } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DismissSecretScanningBypassResponseSuccess = {
                    success: true,
                    message: "Bypass response dismissed successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    bypass_response_id: input.bypass_response_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DismissSecretScanningBypassResponseFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
