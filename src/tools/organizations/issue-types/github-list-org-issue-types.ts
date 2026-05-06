import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    ListOrgIssueTypesFailure,
    ListOrgIssueTypesSuccess,
    OrgIssueTypeRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainIssueTypeRows(data: unknown): OrgIssueTypeRow[] {
    if (!Array.isArray(data)) {
        return [];
    }
    return (data as unknown[]).map((row) => JSON.parse(JSON.stringify(row)) as OrgIssueTypeRow);
}

export function registerGithubListOrgIssueTypesTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_list_org_issue_types",
        "List **all issue types** for an organization (GET /orgs/{org}/issue-types). " +
            "Each item includes **`id`**, **`node_id`**, **`name`**, **`description`**, optional **`color`**, **`is_enabled`**, timestamps, per GitHub. " +
            "Classic tokens need **`read:org`**. **404** when the org is not found or not accessible. " +
            "See [List issue types for an organization](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10#list-issue-types-for-an-organization).",
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
                const response = await octokit.request("GET /orgs/{org}/issue-types", {
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const issue_types = toPlainIssueTypeRows(response.data);
                const successPayload: ListOrgIssueTypesSuccess = {
                    success: true,
                    message: "Organization issue types retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    issue_types,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: ListOrgIssueTypesFailure = {
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
