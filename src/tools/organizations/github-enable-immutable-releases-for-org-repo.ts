import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    EnableImmutableReleasesForOrgRepoFailure,
    EnableImmutableReleasesForOrgRepoSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubEnableImmutableReleasesForOrgRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_enable_immutable_releases_for_org_repo",
        "Add one repository to the org **selected** immutable-releases enforcement list (PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id}). " +
            "The org policy **`enforced_repositories`** must be **`selected`**. Does **not** replace the full list (use `github_set_immutable_releases_for_org_repos` for bulk replace). " +
            "Returns **204** with no body on success. OAuth and classic PATs typically need **`admin:org`**. " +
            "See [Enable a selected repository for immutable releases in an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#enable-a-selected-repository-for-immutable-releases-in-an-organization).",
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
                const response = await octokit.rest.orgs.enableSelectedRepositoryImmutableReleasesOrganization({
                    org: input.org,
                    repository_id: input.repository_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: EnableImmutableReleasesForOrgRepoSuccess = {
                    success: true,
                    message: "Repository added to organization immutable releases enforcement selection.",
                    http_status: response.status,
                    org: input.org,
                    repository_id: input.repository_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: EnableImmutableReleasesForOrgRepoFailure = {
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
