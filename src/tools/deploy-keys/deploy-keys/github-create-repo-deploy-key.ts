import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CreateRepoDeployKeyFailure, CreateRepoDeployKeySuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubCreateRepoDeployKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_repo_deploy_key",
        "Create a deploy key for a repository (POST /repos/{owner}/{repo}/keys). " +
            "**`key`** (SSH public key contents) is required; optional **`title`** and **`read_only`** " +
            "(if true, read-only; otherwise read/write — write access is powerful). Success is HTTP **201**. " +
            "See [Create a deploy key](https://docs.github.com/en/rest/deploy-keys/deploy-keys?apiVersion=2026-03-10#create-a-deploy-key).",
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
            key: z.string().min(1).describe("Contents of the SSH public key."),
            title: z.string().min(1).optional().describe("A name for the key."),
            read_only: z
                .boolean()
                .optional()
                .describe(
                    "If true, the key can only read repository contents; otherwise it can read and write."
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.repos.createDeployKey({
                    owner: input.owner,
                    repo: input.name,
                    key: input.key,
                    ...(input.title !== undefined ? { title: input.title } : {}),
                    ...(input.read_only !== undefined ? { read_only: input.read_only } : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CreateRepoDeployKeySuccess = {
                    success: true,
                    message: "Deploy key created successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    name: input.name,
                    deploy_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateRepoDeployKeyFailure = {
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
