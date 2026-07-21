import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    HostedRunnerItem,
    ListCustomImagesForOrgFailure,
    ListCustomImagesForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function parseBody(data: unknown): { total_count: number; rows: unknown[] } {
    if (data && typeof data === "object" && "images" in data) {
        const o = data as Record<string, unknown>;
        const rows = Array.isArray(o.images) ? o.images : [];
        const total_count = typeof o.total_count === "number" ? o.total_count : rows.length;
        return { total_count, rows };
    }
    return { total_count: 0, rows: [] };
}

export function registerGithubListCustomImagesForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_custom_images_for_org",
        "List custom images for GitHub-hosted runners in an organization (GET /orgs/{org}/actions/hosted-runners/images/custom). " +
            "Returns **`total_count`** and **`images`** rows (`id`, `platform`, `total_versions_size`, `name`, `source`, `versions_count`, `latest_version`, `state`). " +
            "Classic OAuth apps and PATs need the **`manage_runners:org`** scope. " +
            "See [List custom images for an organization](https://docs.github.com/en/rest/actions/hosted-runners?apiVersion=2026-03-10#list-custom-images-for-an-organization).",
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
                const response = await octokit.rest.actions.listCustomImagesForOrg({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const parsed = parseBody(response.data);
                const successPayload: ListCustomImagesForOrgSuccess = {
                    success: true,
                    message: "Custom images listed successfully.",
                    http_status: response.status,
                    org: input.org,
                    total_count: parsed.total_count,
                    images: parsed.rows.map((row) => JSON.parse(JSON.stringify(row)) as HostedRunnerItem),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListCustomImagesForOrgFailure = {
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
