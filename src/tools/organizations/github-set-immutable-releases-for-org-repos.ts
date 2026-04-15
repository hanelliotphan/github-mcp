import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetImmutableReleasesForOrgReposFailure,
    SetImmutableReleasesForOrgReposSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetImmutableReleasesForOrgReposTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_immutable_releases_for_org_repos",
        "Replace the list of repositories under **selected** immutable-releases enforcement for an organization (PUT /orgs/{org}/settings/immutable-releases/repositories). " +
            "GitHub **replaces** the entire selection with **`selected_repository_ids`**; the org policy **`enforced_repositories`** must already be **`selected`** (set via `github_set_org_immutable_releases_settings`). " +
            "Pass an **empty** array to clear the selection. Returns **204** with no body on success. OAuth and classic PATs typically need **`admin:org`**. " +
            "See [Set selected repositories for immutable releases enforcement](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#set-selected-repositories-for-immutable-releases-enforcement).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            selected_repository_ids: z.array(z.number().int().min(1))
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.setImmutableReleasesSettingsRepositories({
                    org: input.org,
                    selected_repository_ids: input.selected_repository_ids
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetImmutableReleasesForOrgReposSuccess = {
                    success: true,
                    message: "Organization immutable releases selected repositories updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    selected_repository_ids: input.selected_repository_ids,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetImmutableReleasesForOrgReposFailure = {
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
