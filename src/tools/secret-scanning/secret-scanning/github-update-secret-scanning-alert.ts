import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateSecretScanningAlertSuccess, UpdateSecretScanningAlertFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}


export function registerGithubUpdateSecretScanningAlertTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_secret_scanning_alert",
        "Update a secret scanning alert (PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}). See [Update a secret scanning alert](https://docs.github.com/en/rest/secret-scanning/secret-scanning?apiVersion=2026-03-10#update-a-secret-scanning-alert).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            alert_number: z.number().int().positive(),
            state: z.enum(["open", "resolved"]),
            resolution: z.union([z.enum(["false_positive", "wont_fix", "revoked", "used_in_tests"]), z.null()]).optional(),
            resolution_comment: z.union([z.string(), z.null()]).optional(),
            assignee: z.union([z.string(), z.null()]).optional(),
            validity: z.union([z.enum(["active", "inactive"]), z.null()]).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.secretScanning.updateAlert({
                    owner: input.owner,
                    repo: input.name,
                    alert_number: input.alert_number,
                    state: input.state,
                    ...(input.resolution !== undefined ? { resolution: input.resolution } : {}),
                    ...(input.resolution_comment !== undefined ? { resolution_comment: input.resolution_comment } : {}),
                    ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
                    ...(input.validity !== undefined ? { validity: input.validity } : {})
                } as Parameters<typeof octokit.rest.secretScanning.updateAlert>[0]);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateSecretScanningAlertSuccess = {
                    success: true,
                    message: "Secret scanning alert updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    name: input.name,
                    alert_number: input.alert_number,
                    alert: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateSecretScanningAlertFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"])
                };
                return textAndData(failurePayload);
            }
        }
    );
}
