import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateCommitStatusFailure, CreateCommitStatusSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateCommitStatusTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_commit_status",
        "Create a commit status (POST /repos/{owner}/{repo}/statuses/{sha}). state is required (error|failure|pending|success); optional target_url, description, and context. See [Create a commit status](https://docs.github.com/en/rest/commits/statuses?apiVersion=2026-03-10#create-a-commit-status).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            sha: z.string().min(1).max(64),
            state: z.enum(["error", "failure", "pending", "success"]),
            target_url: z.string().url().nullable().optional(),
            description: z.string().nullable().optional(),
            context: z.string().min(1).optional()
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createCommitStatus({
                    owner: input.owner,
                    repo: input.name,
                    sha: input.sha,
                    state: input.state,
                    ...(input.target_url !== undefined ? { target_url: input.target_url } : {}),
                    ...(input.description !== undefined ? { description: input.description } : {}),
                    ...(input.context !== undefined ? { context: input.context } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateCommitStatusSuccess = {
                    success: true,
                    message: "Commit status created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    sha: input.sha,
                    status: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateCommitStatusFailure = {
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
