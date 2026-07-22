import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    RemoveSelectedRepoFromOrgAgentSecretFailure,
    RemoveSelectedRepoFromOrgAgentSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubRemoveSelectedRepoFromOrgAgentSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_remove_selected_repo_from_org_agent_secret",
        "Remove a single repository from a `selected`-visibility organization GitHub agent secret (DELETE /orgs/{org}/agents/secrets/{secret_name}/repositories/{repository_id}). " +
            "The secret's visibility must be `selected` (otherwise GitHub returns 409). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Success is HTTP **204**. " +
            "See [Remove selected repository from an organization secret](https://docs.github.com/en/rest/agents/secrets?apiVersion=2026-03-10#remove-selected-repository-from-an-organization-secret).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
            repository_id: z.number().int().positive().describe("The unique identifier of the repository.")
        },
        async (input) => {
            try {
                const response = await octokit.request(
                    "DELETE /orgs/{org}/agents/secrets/{secret_name}/repositories/{repository_id}",
                    {
                        org: input.org,
                        secret_name: input.secret_name,
                        repository_id: input.repository_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RemoveSelectedRepoFromOrgAgentSecretSuccess = {
                    success: true,
                    message: "Repository removed from organization agent secret successfully.",
                    http_status: response.status,
                    org: input.org,
                    secret_name: input.secret_name,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RemoveSelectedRepoFromOrgAgentSecretFailure = {
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
