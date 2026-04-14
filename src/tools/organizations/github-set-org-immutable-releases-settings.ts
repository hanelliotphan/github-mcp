import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetOrgImmutableReleasesSettingsFailure,
    SetOrgImmutableReleasesSettingsSuccess
} from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetOrgImmutableReleasesSettingsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_org_immutable_releases_settings",
        "Set immutable releases policy for an organization (PUT /orgs/{org}/settings/immutable-releases). " +
            "**`enforced_repositories`** must be `all`, `none`, or `selected`. " +
            "When using **`selected`**, you may pass **`selected_repository_ids`** (numeric repo ids); omit it to change only the policy mode. " +
            "Returns **204** with no body on success. OAuth and classic PATs typically need **`admin:org`**. " +
            "See [Set immutable releases settings for an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#set-immutable-releases-settings-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            enforced_repositories: z.enum(["all", "none", "selected"]),
            selected_repository_ids: z.array(z.number().int().min(1)).optional()
        },
        async (input) => {
            if (input.selected_repository_ids !== undefined && input.enforced_repositories !== "selected") {
                const failurePayload: SetOrgImmutableReleasesSettingsFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message:
                            'selected_repository_ids may only be set when enforced_repositories is "selected" (per GitHub REST API).',
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }

            const params: {
                org: string;
                enforced_repositories: "all" | "none" | "selected";
                selected_repository_ids?: number[];
            } = {
                org: input.org,
                enforced_repositories: input.enforced_repositories
            };
            if (input.selected_repository_ids !== undefined) {
                params.selected_repository_ids = input.selected_repository_ids;
            }

            try {
                const response = await octokit.rest.orgs.setImmutableReleasesSettings(params);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetOrgImmutableReleasesSettingsSuccess = {
                    success: true,
                    message: "Organization immutable releases settings updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    enforced_repositories: input.enforced_repositories,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetOrgImmutableReleasesSettingsFailure = {
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
