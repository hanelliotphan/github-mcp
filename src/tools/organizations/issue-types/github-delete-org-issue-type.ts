import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgIssueTypeFailure, DeleteOrgIssueTypeSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgIssueTypeTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org_issue_type",
        "Delete an organization issue type (DELETE /orgs/{org}/issue-types/{issue_type_id}). " +
            "Success is HTTP **204** No Content. " +
            "Requires **org admin**; classic tokens need **`admin:org`**. **422** when validation fails. " +
            "See [Delete issue type for an organization](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10#delete-issue-type-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            issue_type_id: z.number().int().positive().describe("Numeric id of the issue type to delete.")
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /orgs/{org}/issue-types/{issue_type_id}", {
                    org: input.org,
                    issue_type_id: input.issue_type_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: DeleteOrgIssueTypeSuccess = {
                    success: true,
                    message: "Organization issue type deleted successfully.",
                    http_status: response.status,
                    org: input.org,
                    issue_type_id: input.issue_type_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgIssueTypeFailure = {
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
