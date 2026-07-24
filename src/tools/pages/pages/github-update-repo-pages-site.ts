import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { UpdateRepoPagesSiteSuccess, UpdateRepoPagesSiteFailure } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubUpdateRepoPagesSiteTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_repo_pages_site",
        "Update a GitHub Pages site (PUT /repos/{owner}/{repo}/pages). Optional **cname** (null clears), **https_enforced**, **build_type**, and **source**. Success is HTTP **204**. See [Update information about a GitHub Pages site](https://docs.github.com/en/rest/pages/pages?apiVersion=2026-03-10#update-information-about-a-github-pages-site).",
        {
            owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            cname: z.union([z.string().min(1), z.null()]).optional().describe("Custom domain; null removes it."),
            https_enforced: z.boolean().optional(),
            build_type: z.enum(["legacy", "workflow"]).optional(),
            source: z.object({
                branch: z.string().min(1),
                path: z.enum(["/", "/docs"])
            }).optional()
        },
        async (input) => {
            try {
                const response = await await octokit.rest.repos.updateInformationAboutPagesSite({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.cname !== undefined ? { cname: input.cname } : {}),
                    ...(input.https_enforced !== undefined ? { https_enforced: input.https_enforced } : {}),
                    ...(input.build_type !== undefined ? { build_type: input.build_type } : {}),
                    ...(input.source !== undefined ? { source: input.source } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateRepoPagesSiteSuccess = {
                    success: true,
                    message: "GitHub Pages site updated successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateRepoPagesSiteFailure = {
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
