import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoSecretScanningCustomPatternsSuccess, DeleteRepoSecretScanningCustomPatternsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const customPatternInputSchema = z.object({
    name: z.string().min(1),
    pattern: z.string().min(1),
    start_delimiter: z.string().optional(),
    end_delimiter: z.string().optional(),
    must_match: z.array(z.string()).optional(),
    must_not_match: z.array(z.string()).optional()
});

const customPatternDeleteSchema = z.object({
    pattern_id: z.number().int().positive(),
    custom_pattern_version: z.union([z.string(), z.null()]).optional()
});

export function registerGithubDeleteRepoSecretScanningCustomPatternsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_secret_scanning_custom_patterns",
        "Bulk delete secret scanning custom patterns for a repository (DELETE /repos/{owner}/{repo}/secret-scanning/custom-patterns). Returns HTTP **204**. See [Bulk delete repository custom patterns](https://docs.github.com/en/rest/secret-scanning/custom-patterns?apiVersion=2026-03-10).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            patterns: z.array(customPatternDeleteSchema).min(1),
            post_delete_action: z.enum(["delete_alerts", "resolve_alerts"]).optional()
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /repos/{owner}/{repo}/secret-scanning/custom-patterns",
                    {
                        owner: input.owner, repo: input.name,
                        patterns: input.patterns,
                        ...(input.post_delete_action !== undefined
                            ? { post_delete_action: input.post_delete_action }
                            : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoSecretScanningCustomPatternsSuccess = {
                    success: true,
                    message: "Custom patterns deleted successfully.",
                    http_status: response.status,
                    owner: input.owner, name: input.name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoSecretScanningCustomPatternsFailure = {
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
