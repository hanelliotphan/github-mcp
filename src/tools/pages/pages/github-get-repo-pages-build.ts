import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoPagesBuildSuccess, GetRepoPagesBuildFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoPagesBuildTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_pages_build",
        "Get a GitHub Pages build by ID (GET /repos/{owner}/{repo}/pages/builds/{build_id}). See [Get GitHub Pages build](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#get-github-pages-build).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            build_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.getPagesBuild({ owner: input.owner, repo: input.name, build_id: input.build_id });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoPagesBuildSuccess = {
                    success: true,
                    message: "GitHub Pages build retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    build_id: input.build_id,
                    build: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoPagesBuildFailure = {
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
