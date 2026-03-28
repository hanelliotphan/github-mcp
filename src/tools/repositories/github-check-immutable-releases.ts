import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CheckImmutableReleasesFailure, CheckImmutableReleasesSuccess } from "../../types.js";
import { getRequestId, isHttpStatus, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCheckImmutableReleasesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_check_immutable_releases",
        "Check whether immutable releases are enabled for a repository (GET /repos/{owner}/{repo}/immutable-releases). Requires admin read access. A 404 from GitHub is returned as enabled: false.",
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
                const response = await octokit.rest.repos.checkImmutableReleases({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CheckImmutableReleasesSuccess = {
                    success: true,
                    message: "Immutable releases status retrieved successfully.",
                    enabled: response.data.enabled,
                    enforced_by_owner: response.data.enforced_by_owner,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const requestId = getRequestId(
                    (error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.[
                        "x-github-request-id"
                    ]
                );

                if (isHttpStatus(error, 404)) {
                    const notEnabledPayload: CheckImmutableReleasesSuccess = {
                        success: true,
                        message:
                            "Immutable releases are not enabled for this repository (GitHub returned 404).",
                        enabled: false,
                        enforced_by_owner: false,
                        request_id: requestId
                    };
                    return textAndData(notEnabledPayload);
                }

                const failurePayload: CheckImmutableReleasesFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: requestId
                };
                return textAndData(failurePayload);
            }
        }
    );
}
