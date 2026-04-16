import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DisableImmutableReleasesForOrgRepoFailure,
    DisableImmutableReleasesForOrgRepoSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDisableImmutableReleasesForOrgRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_disable_immutable_releases_for_org_repo",
        "Remove one repository from the org **selected** immutable-releases enforcement list (DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id}). " +
            "The org policy **`enforced_repositories`** must be **`selected`**. Returns **204** with no body on success. OAuth and classic PATs typically need **`admin:org`**. " +
            "See [Disable a selected repository for immutable releases in an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#disable-a-selected-repository-for-immutable-releases-in-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            repository_id: z.number().int().min(1)
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.disableSelectedRepositoryImmutableReleasesOrganization({
                    org: input.org,
                    repository_id: input.repository_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DisableImmutableReleasesForOrgRepoSuccess = {
                    success: true,
                    message: "Repository removed from organization immutable releases enforcement selection.",
                    http_status: response.status,
                    org: input.org,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DisableImmutableReleasesForOrgRepoFailure = {
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
