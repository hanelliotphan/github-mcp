import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetAllowedActionsRepositoryFailure,
    SetAllowedActionsRepositorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetAllowedActionsRepositoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_allowed_actions_repository",
        "Set allowed actions and reusable workflows for a repository (PUT /repos/{owner}/{repo}/actions/permissions/selected-actions). " +
            "Optionally provide **`github_owned_allowed`**, **`verified_allowed`**, and **`patterns_allowed`** (array of action patterns). Applies when `allowed_actions` is `selected`. " +
            "The authenticated user must have **admin** access. Classic OAuth apps and PATs need the **`repo`** scope. Success is HTTP **204**. " +
            "See [Set allowed actions and reusable workflows for a repository](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-allowed-actions-and-reusable-workflows-for-a-repository).",
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
            github_owned_allowed: z
                .boolean()
                .optional()
                .describe("Whether GitHub-owned actions are allowed."),
            verified_allowed: z
                .boolean()
                .optional()
                .describe("Whether actions from verified creators are allowed."),
            patterns_allowed: z
                .array(z.string())
                .optional()
                .describe("Specific action patterns allowed to run.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.setAllowedActionsRepository({
                    owner: input.owner,
                    repo: input.name,
                    ...(input.github_owned_allowed !== undefined
                        ? { github_owned_allowed: input.github_owned_allowed }
                        : {}),
                    ...(input.verified_allowed !== undefined
                        ? { verified_allowed: input.verified_allowed }
                        : {}),
                    ...(input.patterns_allowed !== undefined
                        ? { patterns_allowed: input.patterns_allowed }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetAllowedActionsRepositorySuccess = {
                    success: true,
                    message: "Allowed actions set successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetAllowedActionsRepositoryFailure = {
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
