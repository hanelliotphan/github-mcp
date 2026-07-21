import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteCustomImageVersionFromOrgFailure,
    DeleteCustomImageVersionFromOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteCustomImageVersionFromOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_custom_image_version_from_org",
        "Delete an image version of a custom image from an organization (DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}). " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. Success is HTTP **204** No Content. " +
            "See [Delete an image version of custom image from the organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#delete-an-image-version-of-custom-image-from-the-organization).",
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
                .describe("Image definition ID of the custom image."),
            version: z.string().min(1).describe("Version of the custom image.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.deleteCustomImageVersionFromOrg({
                    org: input.org,
                    image_definition_id: input.image_definition_id,
                    version: input.version
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteCustomImageVersionFromOrgSuccess = {
                    success: true,
                    message: "Custom image version deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    image_definition_id: input.image_definition_id,
                    version: input.version,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteCustomImageVersionFromOrgFailure = {
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
