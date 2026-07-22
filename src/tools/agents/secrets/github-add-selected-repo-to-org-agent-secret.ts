import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AddSelectedRepoToOrgAgentSecretFailure,
    AddSelectedRepoToOrgAgentSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubAddSelectedRepoToOrgAgentSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_add_selected_repo_to_org_agent_secret",
        "Add a single repository to a `selected`-visibility organization GitHub agent secret (PUT /orgs/{org}/agents/secrets/{secret_name}/repositories/{repository_id}). " +
            "The secret's visibility must be `selected` (otherwise GitHub returns 409). " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Success is HTTP **204**. " +
            "See [Add selected repository to an organization secret](https://docs.github.com/en/rest/agents/secrets?apiVersion=2026-03-10#add-selected-repository-to-an-organization-secret).",
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
                    "PUT /orgs/{org}/agents/secrets/{secret_name}/repositories/{repository_id}",
                    {
                        org: input.org,
                        secret_name: input.secret_name,
                        repository_id: input.repository_id
                    }
                );
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: AddSelectedRepoToOrgAgentSecretSuccess = {
                    success: true,
                    message: "Repository added to organization agent secret successfully.",
                    http_status: response.status,
                    org: input.org,
                    secret_name: input.secret_name,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: AddSelectedRepoToOrgAgentSecretFailure = {
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
