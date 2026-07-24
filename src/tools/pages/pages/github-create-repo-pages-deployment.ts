import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoPagesDeploymentSuccess, CreateRepoPagesDeploymentFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoPagesDeploymentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_pages_deployment",
        "Create a GitHub Pages deployment (POST /repos/{owner}/{repo}/pages/deployments). Requires **pages_build_version** and **oidc_token**, plus **artifact_id** or **artifact_url**. See [Create a GitHub Pages deployment](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#create-a-github-pages-deployment).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            artifact_id: z.number().optional(),
            artifact_url: z.string().url().optional(),
            environment: z.string().min(1).optional(),
            pages_build_version: z.string().min(1),
            oidc_token: z.string().min(1)
        },
        async (input) => {
            if (input.artifact_id === undefined && input.artifact_url === undefined) {
                const failurePayload: CreateRepoPagesDeploymentFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: "Either artifact_id or artifact_url is required.",
                        hint: "Provide one of artifact_id or artifact_url.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            try {
                const response = await octokit.rest.repos.createPagesDeployment({
                    owner: input.owner,
                    repo: input.name,
                    pages_build_version: input.pages_build_version,
                    oidc_token: input.oidc_token,
                    ...(input.artifact_id !== undefined ? { artifact_id: input.artifact_id } : {}),
                    ...(input.artifact_url !== undefined ? { artifact_url: input.artifact_url } : {}),
                    ...(input.environment !== undefined ? { environment: input.environment } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoPagesDeploymentSuccess = {
                    success: true,
                    message: "GitHub Pages deployment created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    deployment: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoPagesDeploymentFailure = {
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
