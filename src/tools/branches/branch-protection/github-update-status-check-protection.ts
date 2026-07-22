import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateStatusCheckProtectionSuccess, UpdateStatusCheckProtectionFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

function toPlainValue(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data));
}

export function registerGithubUpdateStatusCheckProtectionTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_status_check_protection",
        "Update status check protection (PATCH .../required_status_checks). See [Update status check protection](https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2026-03-10#update-status-check-protection).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            branch: z.string().min(1).max(255),
            strict: z.boolean().optional(),
            contexts: z.array(z.string()).optional(),
            checks: z
                .array(
                    z.object({
                        context: z.string().min(1),
                        app_id: z.number().int().optional()
                    })
                )
                .optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.updateStatusCheckProtection({
                    owner: input.owner,
                    repo: input.name,
                    branch: input.branch,
                    ...(input.strict !== undefined ? { strict: input.strict } : {}),
                    ...(input.contexts !== undefined ? { contexts: input.contexts } : {}),
                    ...(input.checks !== undefined ? { checks: input.checks } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateStatusCheckProtectionSuccess = {
                    success: true,
                    message: "Status check protection updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    branch: input.branch,
                    required_status_checks: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateStatusCheckProtectionFailure = {
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
