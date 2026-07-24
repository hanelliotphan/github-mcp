import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetLatestRepoPagesBuildSuccess, GetLatestRepoPagesBuildFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetLatestRepoPagesBuildTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_latest_repo_pages_build",
        "Get the latest GitHub Pages build (GET /repos/{owner}/{repo}/pages/builds/latest). See [Get latest Pages build](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#get-latest-pages-build).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.getLatestPagesBuild({ owner: input.owner, repo: input.name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetLatestRepoPagesBuildSuccess = {
                    success: true,
                    message: "Latest GitHub Pages build retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    build: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetLatestRepoPagesBuildFailure = {
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
