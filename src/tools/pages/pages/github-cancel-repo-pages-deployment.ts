import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CancelRepoPagesDeploymentSuccess, CancelRepoPagesDeploymentFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCancelRepoPagesDeploymentTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_cancel_repo_pages_deployment",
        "Cancel a GitHub Pages deployment (POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel). Success is typically HTTP **204**. See [Cancel a GitHub Pages deployment](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#cancel-a-github-pages-deployment).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            pages_deployment_id: z.union([z.number().int().positive(), z.string().min(1)])
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.cancelPagesDeployment({ owner: input.owner, repo: input.name, pages_deployment_id: input.pages_deployment_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CancelRepoPagesDeploymentSuccess = {
                    success: true,
                    message: "GitHub Pages deployment canceled successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    pages_deployment_id: input.pages_deployment_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CancelRepoPagesDeploymentFailure = {
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
