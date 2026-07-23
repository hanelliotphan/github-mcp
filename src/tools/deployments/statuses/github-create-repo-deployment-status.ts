import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoDeploymentStatusSuccess, CreateRepoDeploymentStatusFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainRows(rows: unknown[]): Record<string, unknown>[] {
    return rows.map((row) => toPlain(row));
}

export function registerGithubCreateRepoDeploymentStatusTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_deployment_status",
        "Create a status for a repository deployment. Success is HTTP **201**. See [Create a deployment status](https://docs.github.com/en/rest/deployments/statuses?apiVersion=2026-03-10#create-a-deployment-status).",
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
            deployment_id: z.number().int().positive().describe("The unique identifier of the deployment."),
            state: z
                .enum(["error", "failure", "inactive", "in_progress", "queued", "pending", "success"])
                .describe("The new status of the deployment."),
            target_url: z.string().optional().describe("Target URL to associate with this status."),
            log_url: z.string().optional().describe("Log URL to associate with this status."),
            description: z.string().max(140).optional().describe("Short description of the status (max 140 characters)."),
            environment: z.string().optional().describe("Name for the target deployment environment."),
            environment_url: z.string().optional().describe("URL for accessing the deployment environment."),
            auto_inactive: z.boolean().optional().describe("Automatically set inactive status on successful deployments.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createDeploymentStatus({
                    owner: input.owner,
                    repo: input.name,
                    deployment_id: input.deployment_id,
                    state: input.state,
                    ...(input.target_url !== undefined ? { target_url: input.target_url } : {}),
                    ...(input.log_url !== undefined ? { log_url: input.log_url } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.environment !== undefined ? { environment: input.environment } : {}),
                    ...(input.environment_url !== undefined ? { environment_url: input.environment_url } : {}),
                    ...(input.auto_inactive !== undefined ? { auto_inactive: input.auto_inactive } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoDeploymentStatusSuccess = {
                    success: true,
                    message: "Created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    deployment_id: input.deployment_id,
                    status: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoDeploymentStatusFailure = {
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
