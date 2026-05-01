import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgIssueFieldFailure,
    CreateOrgIssueFieldSuccess,
    OrgIssueFieldRow
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

const issueFieldOptionSchema = z
    .object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        color: issueFieldOptionColorSchema,
        priority: z.number().int()
    })
    .strict();

const createOrgIssueFieldInputSchema = z
    .object({
        org: z
            .string()
            .min(1)
            .max(39)
            .regex(
                orgLoginRegex,
                "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
            ),
        name: z.string().min(1).describe("Display name of the issue field."),
        description: z.string().nullable().optional(),
        data_type: z.enum(["text", "date", "single_select", "number"]),
        visibility: z.enum(["organization_members_only", "all"]).optional(),
        options: z.array(issueFieldOptionSchema).optional()
    })
    .strict()
    .superRefine((data, ctx) => {
        if (data.data_type === "single_select") {
            if (data.options == null || data.options.length === 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "GitHub requires a non-empty options array when data_type is single_select.",
                    path: ["options"]
                });
            }
        } else if (data.options != null && data.options.length > 0) {
            ctx.addIssue({
                code: "custom",
                message: "options may only be set when data_type is single_select.",
                path: ["options"]
            });
        }
    });

function toPlainIssueField(data: unknown): OrgIssueFieldRow {
    return JSON.parse(JSON.stringify(data)) as OrgIssueFieldRow;
}

export function registerGithubCreateOrgIssueFieldTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_issue_field",
        "Create an organization issue field (POST /orgs/{org}/issue-fields). " +
            "Requires **`name`** and **`data_type`** (`text`, `date`, `single_select`, `number`). " +
            "For **`single_select`**, provide a non-empty **`options`** array: each option needs **`name`**, **`color`**, and **`priority`** (integer ordering); optional **`description`**. " +
            "Optional **`visibility`**: `organization_members_only` (default) or `all` when the feature is enabled. " +
            "Requires **org admin**; classic tokens need **`admin:org`**. **422** on validation errors. " +
            "See [Create issue field for an organization](https://docs.github.com/en/rest/orgs/issue-fields?apiVersion=2026-03-10#create-issue-field-for-an-organization).",
        {
            org: createOrgIssueFieldInputSchema.shape.org,
            name: createOrgIssueFieldInputSchema.shape.name,
            description: createOrgIssueFieldInputSchema.shape.description,
            data_type: createOrgIssueFieldInputSchema.shape.data_type,
            visibility: createOrgIssueFieldInputSchema.shape.visibility,
            options: createOrgIssueFieldInputSchema.shape.options
        },
        async (rawInput) => {
            const parsed = createOrgIssueFieldInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: CreateOrgIssueFieldFailure = {
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
                    data_type: typeof input.data_type;
                    description?: string | null;
                    visibility?: typeof input.visibility;
                    options?: z.infer<typeof issueFieldOptionSchema>[];
                } = {
                    name: input.name,
                    data_type: input.data_type
                };
                if (input.description !== undefined) {
                    body.description = input.description;
                }
                if (input.visibility !== undefined) {
                    body.visibility = input.visibility;
                }
                if (input.data_type === "single_select" && input.options != null) {
                    body.options = input.options;
                }

                const response = await octokit.request("POST /orgs/{org}/issue-fields", {
                    org: input.org,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const issue_field = toPlainIssueField(response.data);
                const successPayload: CreateOrgIssueFieldSuccess = {
                    success: true,
                    message: "Organization issue field created successfully.",
                    http_status: response.status,
                    org: input.org,
                    issue_field,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgIssueFieldFailure = {
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
