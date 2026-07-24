import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgProjectItemSuccess,
    GetOrgProjectItemFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

function toPlainList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((row) => toPlain(row));
}

export function registerGithubGetOrgProjectItemTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_project_item",
        "Get an item on an organization-owned project (GET /orgs/{org}/projectsV2/{project_number}/items/{item_id}). " +
            "Optional **`fields`** limits returned field values by ID. " +
            "See [Organization project item](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#get-an-item-for-an-organization-owned-project).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            project_number: z.number().int().positive(),
            item_id: z.number().int().positive(),
            fields: z
                .array(z.number().int().positive())
                .optional()
                .describe("Field IDs to include; sent as comma-separated `fields` query")
        },
        async (input) => {
            try {
                const params: Record<string, unknown> = {
                    org: input.org,
                    project_number: input.project_number,
                    item_id: input.item_id
                };
                if (input.fields !== undefined && input.fields.length > 0) {
                    params.fields = input.fields.map(String).join(",");
                }
                const response = await octokit.rest.projects.getOrgItem(params as never);
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgProjectItemSuccess = {
                    success: true,
                    message: "Organization project item retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    project_number: input.project_number,
                    item_id: input.item_id,
                    item: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgProjectItemFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
