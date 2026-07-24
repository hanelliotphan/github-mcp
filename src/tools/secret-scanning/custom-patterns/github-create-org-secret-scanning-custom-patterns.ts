import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateOrgSecretScanningCustomPatternsSuccess, CreateOrgSecretScanningCustomPatternsFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

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

export function registerGithubCreateOrgSecretScanningCustomPatternsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_secret_scanning_custom_patterns",
        "Bulk create secret scanning custom patterns for an organization (POST /orgs/{org}/secret-scanning/custom-patterns). See [Bulk create organization custom patterns](https://docs.github.com/en/rest/secret-scanning/custom-patterns?apiVersion=2026-03-10).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            patterns: z.array(customPatternInputSchema).min(1)
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "POST /orgs/{org}/secret-scanning/custom-patterns",
                    { org: input.org, patterns: input.patterns } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateOrgSecretScanningCustomPatternsSuccess = {
                    success: true,
                    message: "Custom patterns created successfully.",
                    http_status: response.status,
                    org: input.org,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgSecretScanningCustomPatternsFailure = {
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
