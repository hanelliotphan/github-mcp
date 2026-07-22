import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    AppInstallationItem,
    GetRepoInstallationForAuthenticatedAppFailure,
    GetRepoInstallationForAuthenticatedAppSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

function toPlain(data: unknown): AppInstallationItem {
    return JSON.parse(JSON.stringify(data)) as AppInstallationItem;
}

export function registerGithubGetRepoInstallationForAuthenticatedAppTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_repo_installation_for_authenticated_app",
        "Get the authenticated GitHub App's installation for a repository (GET /repos/{owner}/{repo}/installation). " +
            "MCP param **`name`** maps to API **`repo`**. " +
            "You must authenticate with a **JWT** (as a GitHub App). " +
            "See [Get a repository installation for the authenticated app](https://docs.github.com/en/rest/apps/apps?apiVersion=2026-03-10#get-a-repository-installation-for-the-authenticated-app).",
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
            try {
                const response = await octokit.rest.apps.getRepoInstallation({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetRepoInstallationForAuthenticatedAppSuccess = {
                    success: true,
                    message: "Repository installation retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name: `${input.owner}/${input.name}`,
                    installation: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetRepoInstallationForAuthenticatedAppFailure = {
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
