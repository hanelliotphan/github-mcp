import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoPagesHealthCheckSuccess, GetRepoPagesHealthCheckFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoPagesHealthCheckTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_pages_health_check",
        "Get a DNS health check for GitHub Pages (GET /repos/{owner}/{repo}/pages/health). **202** means the check is still computing; retry for **200**. See [Get a DNS health check for GitHub Pages](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#get-a-dns-health-check-for-github-pages).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.getPagesHealthCheck({ owner: input.owner, repo: input.name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const status = response.status as number;
                const successPayload: GetRepoPagesHealthCheckSuccess = {
                    success: true,
                    message:
                        status === 202
                            ? "Pages DNS health check is computing; retry shortly."
                            : "Pages DNS health check retrieved successfully.",
                    http_status: status,
                    owner: input.owner,
                    name: input.name,
                    health: status === 200 ? toPlain(response.data) : null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoPagesHealthCheckFailure = {
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
