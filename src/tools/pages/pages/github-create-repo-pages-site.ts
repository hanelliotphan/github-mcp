import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoPagesSiteSuccess, CreateRepoPagesSiteFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoPagesSiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_pages_site",
        "Create/configure a GitHub Pages site (POST /repos/{owner}/{repo}/pages). Optional **build_type** (`legacy`|`workflow`) and **source** ({branch, path}). See [Create a GitHub Pages site](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#create-a-github-pages-site).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            build_type: z.enum(["legacy", "workflow"]).optional(),
            source: z.object({
                branch: z.string().min(1),
                path: z.enum(["/", "/docs"]).optional()
            }).optional()
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.createPagesSite({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.build_type !== undefined ? { build_type: input.build_type } : {}),
                    ...(input.source !== undefined ? { source: input.source } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoPagesSiteSuccess = {
                    success: true,
                    message: "GitHub Pages site created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    pages: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoPagesSiteFailure = {
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
