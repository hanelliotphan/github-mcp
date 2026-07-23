import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoDeploymentSuccess, CreateRepoDeploymentFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}


export function registerGithubCreateRepoDeploymentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_deployment",
        "Create a deployment for a repository. Success is HTTP **201** or **202**. See [Create a deployment](https://docs.github.com/en/rest/deployments/deployments?apiVersion=2026-03-10#create-a-deployment).",
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
            ref: z.string().min(1).describe("The ref to deploy (branch, tag, or SHA)."),
            task: z.string().optional().describe("Specifies a task to execute."),
            auto_merge: z.boolean().optional().describe("Attempts to automatically merge the default branch into the requested ref."),
            required_contexts: z.array(z.string()).optional().describe("Status contexts that must pass before deployment proceeds."),
            payload: z.union([z.record(z.string(), z.unknown()), z.string()]).optional().describe("JSON payload passed to deployment hooks."),
            environment: z.string().optional().describe("Name of the deployment environment."),
            description: z.union([z.string(), z.null()]).optional().describe("Short description of the deployment."),
            transient_environment: z.boolean().optional().describe("Specifies whether the environment is transient."),
            production_environment: z.boolean().optional().describe("Specifies whether the environment is production.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createDeployment({
                    owner: input.owner,
                    repo: input.name,
                    ref: input.ref,
                    ...(input.task !== undefined ? { task: input.task } : {}),
                    ...(input.auto_merge !== undefined ? { auto_merge: input.auto_merge } : {}),
                    ...(input.required_contexts !== undefined ? { required_contexts: input.required_contexts } : {}),
                    ...(input.payload !== undefined ? { payload: input.payload } : {}),
                    ...(input.environment !== undefined ? { environment: input.environment } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.transient_environment !== undefined ? { transient_environment: input.transient_environment } : {}),
                    ...(input.production_environment !== undefined ? { production_environment: input.production_environment } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoDeploymentSuccess = {
                    success: true,
                    message:
                        response.status === 202
                            ? "Auto-merged default branch into the requested ref instead of creating a deployment; retry create after the merge."
                            : "Deployment created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    deployment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoDeploymentFailure = {
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
