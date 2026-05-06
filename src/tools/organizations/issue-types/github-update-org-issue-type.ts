import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgIssueTypeRow,
    UpdateOrgIssueTypeFailure,
    UpdateOrgIssueTypeSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const issueTypeColorSchema = z.enum([
    "gray",
    "blue",
    "green",
    "yellow",
    "orange",
    "red",
    "pink",
    "purple"
]);

const updateOrgIssueTypeInputSchema = z
    .object({
        org: z
            .string()
            .min(1)
            .max(39)
            .regex(
                orgLoginRegex,
                "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
            ),
        issue_type_id: z.number().int().positive(),
        name: z.string().min(1).describe("Name of the issue type."),
        is_enabled: z.boolean().describe("Whether the issue type is enabled at the organization level."),
        description: z.string().nullable().optional(),
        color: issueTypeColorSchema.nullable().optional()
    })
    .strict();

function toPlainIssueType(data: unknown): OrgIssueTypeRow {
    return JSON.parse(JSON.stringify(data)) as OrgIssueTypeRow;
}

export function registerGithubUpdateOrgIssueTypeTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_issue_type",
        "Update an organization issue type (PUT /orgs/{org}/issue-types/{issue_type_id}). " +
            "Requires **`name`**, **`is_enabled`**, and **`issue_type_id`**. Optional **`description`** and **`color`** " +
            "(`gray`, `blue`, …, `purple`, or **`null`**). " +
            "Requires **org admin**; classic tokens need **`admin:org`**. **422** on validation errors. " +
            "See [Update issue type for an organization](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10#update-issue-type-for-an-organization).",
        {
            org: updateOrgIssueTypeInputSchema.shape.org,
            issue_type_id: updateOrgIssueTypeInputSchema.shape.issue_type_id,
            name: updateOrgIssueTypeInputSchema.shape.name,
            is_enabled: updateOrgIssueTypeInputSchema.shape.is_enabled,
            description: updateOrgIssueTypeInputSchema.shape.description,
            color: updateOrgIssueTypeInputSchema.shape.color
        },
        async (rawInput) => {
            const parsed = updateOrgIssueTypeInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: UpdateOrgIssueTypeFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message: parsed.error.issues.map((i) => i.message).join("; "),
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(failurePayload);
            }
            const input = parsed.data;
            try {
                const body: {
                    name: string;
                    is_enabled: boolean;
                    description?: string | null;
                    color?: z.infer<typeof issueTypeColorSchema> | null;
                } = {
                    name: input.name,
                    is_enabled: input.is_enabled
                };
                if (input.description !== undefined) {
                    body.description = input.description;
                }
                if (input.color !== undefined) {
                    body.color = input.color;
                }

                const response = await octokit.request("PUT /orgs/{org}/issue-types/{issue_type_id}", {
                    org: input.org,
                    issue_type_id: input.issue_type_id,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const issue_type = toPlainIssueType(response.data);
                const successPayload: UpdateOrgIssueTypeSuccess = {
                    success: true,
                    message: "Organization issue type updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    issue_type_id: input.issue_type_id,
                    issue_type,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgIssueTypeFailure = {
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
