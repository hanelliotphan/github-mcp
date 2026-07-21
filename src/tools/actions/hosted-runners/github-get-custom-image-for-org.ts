import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetCustomImageForOrgFailure,
    GetCustomImageForOrgSuccess,
    HostedRunnerItem
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetCustomImageForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_custom_image_for_org",
        "Get a custom image definition for GitHub Actions Hosted Runners (GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}). " +
            "Returns the image definition (`id`, `platform`, `total_versions_size`, `name`, `source`, `versions_count`, `latest_version`, `state`). " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. " +
            "See [Get a custom image definition for GitHub Actions Hosted Runners](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#get-a-custom-image-definition-for-github-actions-hosted-runners).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            image_definition_id: z
                .number()
                .int()
                .positive()
                .describe("Image definition ID of the custom image.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getCustomImageForOrg({
                    org: input.org,
                    image_definition_id: input.image_definition_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCustomImageForOrgSuccess = {
                    success: true,
                    message: "Custom image retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    image_definition_id: input.image_definition_id,
                    image: JSON.parse(JSON.stringify(response.data)) as HostedRunnerItem,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCustomImageForOrgFailure = {
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
