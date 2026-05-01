import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    OrgIssueFieldRow,
    UpdateOrgIssueFieldFailure,
    UpdateOrgIssueFieldSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const issueFieldOptionColorSchema = z.enum([
    "gray",
    "blue",
    "green",
    "yellow",
    "orange",
    "red",
    "pink",
    "purple"
]);

/** Option entry for PATCH: include **`id`** to keep or update an existing option; omit **`id`** for a new option (replaces the full options set when sent). */
const issueFieldPatchOptionSchema = z
    .object({
        id: z.number().int().positive().optional(),
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        color: issueFieldOptionColorSchema,
        priority: z.number().int()
    })
    .strict();

const updateOrgIssueFieldInputSchema = z
    .object({
        org: z
            .string()
            .min(1)
            .max(39)
            .regex(
                orgLoginRegex,
                "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
            ),
        issue_field_id: z.number().int().positive(),
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        visibility: z.enum(["organization_members_only", "all"]).optional(),
        options: z.array(issueFieldPatchOptionSchema).optional()
    })
    .strict()
    .superRefine((data, ctx) => {
        if (
            data.name === undefined &&
            data.description === undefined &&
            data.visibility === undefined &&
            data.options === undefined
        ) {
            ctx.addIssue({
                code: "custom",
                message:
                    "Provide at least one of name, description, visibility, or options to update the issue field.",
                path: []
            });
        }
    });

function toPlainIssueField(data: unknown): OrgIssueFieldRow {
    return JSON.parse(JSON.stringify(data)) as OrgIssueFieldRow;
}

export function registerGithubUpdateOrgIssueFieldTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_issue_field",
        "Update an organization issue field (PATCH /orgs/{org}/issue-fields/{issue_field_id}). " +
            "Send at least one of **`name`**, **`description`**, **`visibility`**, or **`options`**. " +
            "For **`single_select`** fields, **`options`** replaces the **entire** option set: include existing rows with their **`id`** to keep them; omit **`id`** to add new options. " +
            "Each option needs **`name`**, **`color`**, and **`priority`**; optional **`description`**. " +
            "Requires **org admin**; classic tokens need **`admin:org`**. **422** on validation errors. " +
            "See [Update issue field for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#update-issue-field-for-an-organization).",
        {
            org: updateOrgIssueFieldInputSchema.shape.org,
            issue_field_id: updateOrgIssueFieldInputSchema.shape.issue_field_id,
            name: updateOrgIssueFieldInputSchema.shape.name,
            description: updateOrgIssueFieldInputSchema.shape.description,
            visibility: updateOrgIssueFieldInputSchema.shape.visibility,
            options: updateOrgIssueFieldInputSchema.shape.options
        },
        async (rawInput) => {
            const parsed = updateOrgIssueFieldInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: UpdateOrgIssueFieldFailure = {
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
                const body: Record<string, unknown> = {};
                if (input.name !== undefined) {
                    body.name = input.name;
                }
                if (input.description !== undefined) {
                    body.description = input.description;
                }
                if (input.visibility !== undefined) {
                    body.visibility = input.visibility;
                }
                if (input.options !== undefined) {
                    body.options = input.options.map((o) => {
                        const row: Record<string, unknown> = {
                            name: o.name,
                            color: o.color,
                            priority: o.priority
                        };
                        if (o.id !== undefined) {
                            row.id = o.id;
                        }
                        if (o.description !== undefined) {
                            row.description = o.description;
                        }
                        return row;
                    });
                }

                const response = await octokit.request("PATCH /orgs/{org}/issue-fields/{issue_field_id}", {
                    org: input.org,
                    issue_field_id: input.issue_field_id,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const issue_field = toPlainIssueField(response.data);
                const successPayload: UpdateOrgIssueFieldSuccess = {
                    success: true,
                    message: "Organization issue field updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    issue_field_id: input.issue_field_id,
                    issue_field,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgIssueFieldFailure = {
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
