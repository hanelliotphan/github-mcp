import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgImmutableReleasesSettingsFailure,
    GetOrgImmutableReleasesSettingsSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetOrgImmutableReleasesSettingsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_immutable_releases_settings",
        "Get immutable releases policy for an organization (GET /orgs/{org}/settings/immutable-releases). " +
            "Returns **`enforced_repositories`** (`all`, `none`, or `selected`) and optional **`selected_repositories_url`**. " +
            "OAuth tokens and classic personal access tokens typically need **`admin:org`** per GitHub. " +
            "See [Get immutable releases settings for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#get-immutable-releases-settings-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.orgs.getImmutableReleasesSettings({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = response.data as {
                    enforced_repositories?: string;
                    selected_repositories_url?: string | null;
                };
                const successPayload: GetOrgImmutableReleasesSettingsSuccess = {
                    success: true,
                    message: "Organization immutable releases settings retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    enforced_repositories: data.enforced_repositories ?? "",
                    selected_repositories_url:
                        data.selected_repositories_url === undefined
                            ? null
                            : data.selected_repositories_url,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgImmutableReleasesSettingsFailure = {
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
