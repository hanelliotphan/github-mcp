import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetAllowedActionsRepositoryFailure,
    GetAllowedActionsRepositorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetAllowedActionsRepositoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_allowed_actions_repository",
        "Get allowed actions and reusable workflows for a repository (GET /repos/{owner}/{repo}/actions/permissions/selected-actions). " +
            "Returns `github_owned_allowed`, `verified_allowed`, and `patterns_allowed`. Applies when `allowed_actions` is `selected`. " +
            "The authenticated user must have **admin** access. Classic OAuth apps and PATs need the **`repo`** scope. " +
            "See [Get allowed actions and reusable workflows for a repository](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#get-allowed-actions-and-reusable-workflows-for-a-repository).",
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
                const response = await octokit.rest.actions.getAllowedActionsRepository({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetAllowedActionsRepositorySuccess = {
                    success: true,
                    message: "Allowed actions retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    allowed_actions: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetAllowedActionsRepositoryFailure = {
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
