import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetWorkflowAccessToRepositoryFailure,
    SetWorkflowAccessToRepositorySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetWorkflowAccessToRepositoryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_workflow_access_to_repository",
        "Set the level of access that other repositories have to a repository's Actions resources (PUT /repos/{owner}/{repo}/actions/permissions/access). " +
            "Provide **`access_level`** (`none`, `user`, `organization`, or `enterprise`). " +
            "The authenticated user must have **admin** access. Classic OAuth apps and PATs need the **`repo`** scope. Success is HTTP **204**. " +
            "See [Set the level of access for workflows outside of the repository](https://docs.github.com/en/rest/actions/permissions?apiVersion=2026-03-10#set-the-level-of-access-for-workflows-outside-of-the-repository).",
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
            access_level: z
                .enum(["none", "user", "organization", "enterprise"])
                .describe("Defines the level of access that workflows outside of the repository have.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.setWorkflowAccessToRepository({
                    owner: input.owner,
                    repo: input.name,
                    access_level: input.access_level as "none" | "user" | "organization"
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetWorkflowAccessToRepositorySuccess = {
                    success: true,
                    message: "Workflow access level set successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    access_level: input.access_level,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetWorkflowAccessToRepositoryFailure = {
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
