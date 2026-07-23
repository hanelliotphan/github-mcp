import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetRepoPullRequestCreationCapFailure,
    GetRepoPullRequestCreationCapSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetRepoPullRequestCreationCapTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_pull_request_creation_cap",
        "Get the pull request creation cap configuration (GET /repos/{owner}/{repo}/interaction-limits/pulls/creation-cap). " +
            "MCP **`name`** maps to API **`repo`**. Requires admin access. " +
            "See [Get pull request creation cap for a repository](https://docs.github.com/en/rest/interactions/repos?apiVersion=2026-03-10#get-pull-request-creation-cap-for-a-repository).",
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
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.request(
                    "GET /repos/{owner}/{repo}/interaction-limits/pulls/creation-cap",
                    {
                        owner: input.owner,
                        repo: input.name
                    } as never
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoPullRequestCreationCapSuccess = {
                    success: true,
                    message: "Pull request creation cap retrieved successfully.",
                    http_status: response.status as number,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    creation_cap: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoPullRequestCreationCapFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                            "x-github-request-id"
                        ]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
