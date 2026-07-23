import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { GetRepoDeployKeyFailure, GetRepoDeployKeySuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoDeployKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_deploy_key",
        "Get a deploy key for a repository (GET /repos/{owner}/{repo}/keys/{key_id}). " +
            "See [Get a deploy key](https://docs.github.com/en/rest/deploy-keys/deploy-keys?apiVersion=2026-03-10#get-a-deploy-key).",
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
            key_id: z.number().int().positive().describe("The unique identifier of the key.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.getDeployKey({
                    owner: input.owner,
                    repo: input.name,
                    key_id: input.key_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoDeployKeySuccess = {
                    success: true,
                    message: "Deploy key retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    key_id: input.key_id,
                    deploy_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoDeployKeyFailure = {
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
