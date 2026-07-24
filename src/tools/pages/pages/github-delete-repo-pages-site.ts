import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteRepoPagesSiteSuccess, DeleteRepoPagesSiteFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubDeleteRepoPagesSiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_repo_pages_site",
        "Delete a GitHub Pages site (DELETE /repos/{owner}/{repo}/pages). Success is HTTP **204**. See [Delete a GitHub Pages site](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#delete-a-github-pages-site).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'")
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.deletePagesSite({ owner: input.owner, repo: input.name });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteRepoPagesSiteSuccess = {
                    success: true,
                    message: "GitHub Pages site deleted successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteRepoPagesSiteFailure = {
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
