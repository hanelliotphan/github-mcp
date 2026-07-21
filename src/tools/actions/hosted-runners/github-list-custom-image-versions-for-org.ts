import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    HostedRunnerItem,
    ListCustomImageVersionsForOrgFailure,
    ListCustomImageVersionsForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "image_versions" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.image_versions) ? o.image_versions : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

export function registerGithubListCustomImageVersionsForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_custom_image_versions_for_org",
        "List image versions of a custom image for an organization (GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions). " +
            "Returns **`total_count`** and **`image_versions`** rows (`version`, `state`, `size_gb`, `created_on`, `state_details`). " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. " +
            "See [List image versions of a custom image for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#list-image-versions-of-a-custom-image-for-an-organization).",
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
                const response = await octokit.rest.actions.listCustomImageVersionsForOrg({
                    org: input.org,
                    image_definition_id: input.image_definition_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: ListCustomImageVersionsForOrgSuccess = {
                    success: true,
                    message: "Custom image versions listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    image_definition_id: input.image_definition_id,
                    total_count: parsed.total_count,
                    image_versions: parsed.rows.map(
                        (row) => JSON.parse(JSON.stringify(row)) as HostedRunnerItem
                    ),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListCustomImageVersionsForOrgFailure = {
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
