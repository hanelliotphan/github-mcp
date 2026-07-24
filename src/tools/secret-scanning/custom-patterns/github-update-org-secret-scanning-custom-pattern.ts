import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateOrgSecretScanningCustomPatternSuccess, UpdateOrgSecretScanningCustomPatternFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}


export function registerGithubUpdateOrgSecretScanningCustomPatternTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_secret_scanning_custom_pattern",
        "Update a secret scanning custom pattern for an organization (PATCH /orgs/{org}/secret-scanning/custom-patterns/{pattern_id}). See [Update an organization custom pattern](https://docs.github.com/en/rest/secret-scanning/custom-patterns?apiVersion=2026-03-10).",
        {
            org: z.string().min(1).max(39).regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            pattern_id: z.number().int().positive(),
            pattern: z.string().min(1).optional(),
            start_delimiter: z.string().optional(),
            end_delimiter: z.string().optional(),
            must_match: z.array(z.string()).optional(),
            must_not_match: z.array(z.string()).optional(),
            custom_pattern_version: z.union([z.string(), z.null()])
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "PATCH /orgs/{org}/secret-scanning/custom-patterns/{pattern_id}",
                    {
                        org: input.org,
                        pattern_id: input.pattern_id,
                        custom_pattern_version: input.custom_pattern_version,
                        ...(input.pattern !== undefined ? { pattern: input.pattern } : {}),
                        ...(input.start_delimiter !== undefined ? { start_delimiter: input.start_delimiter } : {}),
                        ...(input.end_delimiter !== undefined ? { end_delimiter: input.end_delimiter } : {}),
                        ...(input.must_match !== undefined ? { must_match: input.must_match } : {}),
                        ...(input.must_not_match !== undefined ? { must_not_match: input.must_not_match } : {})
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgSecretScanningCustomPatternSuccess = {
                    success: true,
                    message: "Custom pattern updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    pattern_id: input.pattern_id,
                    custom_pattern: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgSecretScanningCustomPatternFailure = {
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
