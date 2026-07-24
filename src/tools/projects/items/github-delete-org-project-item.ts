import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    DeleteOrgProjectItemSuccess,
    DeleteOrgProjectItemFailure
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgProjectItemTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_project_item",
        "Delete an item from a organization-owned project (DELETE /orgs/{org}/projectsV2/{project_number}/items/{item_id}). Success is HTTP **204**. " +
            "See [Delete project item for organization](https://docs.github.com/en/rest/projects/items?apiVersion=2026-03-10#delete-project-item-for-organization).",
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
            item_id: z.number().int().positive()
        },
        async (input) => {
            try {
                const response = await octokit.rest.projects.deleteItemForOrg({
                    org: input.org,
                    project_number: input.project_number,
                    item_id: input.item_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgProjectItemSuccess = {
                    success: true,
                    message: "Organization project item deleted successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    project_number: input.project_number,
                    item_id: input.item_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgProjectItemFailure = {
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
