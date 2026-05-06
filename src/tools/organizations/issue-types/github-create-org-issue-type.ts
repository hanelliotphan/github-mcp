import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgIssueTypeFailure,
    CreateOrgIssueTypeSuccess,
    OrgIssueTypeRow
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

const createOrgIssueTypeInputSchema = z
    .object({
        org: z
            .string()
            .min(1)
            .max(39)
            .regex(
                orgLoginRegex,
                "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
            ),
        name: z.string().min(1).describe("Name of the issue type."),
        is_enabled: z.boolean().describe("Whether the issue type is enabled at the organization level."),
        description: z.string().nullable().optional(),
        color: issueTypeColorSchema.nullable().optional()
    })
    .strict();

function toPlainIssueType(data: unknown): OrgIssueTypeRow {
    return JSON.parse(JSON.stringify(data)) as OrgIssueTypeRow;
}

export function registerGithubCreateOrgIssueTypeTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_issue_type",
        "Create an organization issue type (POST /orgs/{org}/issue-types). " +
            "Requires **`name`** and **`is_enabled`**. Optional **`description`** and **`color`** " +
            "(`gray`, `blue`, `green`, `yellow`, `orange`, `red`, `pink`, `purple`, or **`null`**). " +
            "Requires **org admin**; classic tokens need **`admin:org`**. **422** on validation errors. " +
            "See [Create issue type for an organization](https://docs.github.com/en/rest/orgs/issue-types?apiVersion=2026-03-10#create-issue-type-for-an-organization).",
        {
            org: createOrgIssueTypeInputSchema.shape.org,
            name: createOrgIssueTypeInputSchema.shape.name,
            is_enabled: createOrgIssueTypeInputSchema.shape.is_enabled,
            description: createOrgIssueTypeInputSchema.shape.description,
            color: createOrgIssueTypeInputSchema.shape.color
        },
        async (rawInput) => {
            const parsed = createOrgIssueTypeInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: CreateOrgIssueTypeFailure = {
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

                const response = await octokit.request("POST /orgs/{org}/issue-types", {
                    org: input.org,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const issue_type = toPlainIssueType(response.data);
                const successPayload: CreateOrgIssueTypeSuccess = {
                    success: true,
                    message: "Organization issue type created successfully.",
                    http_status: response.status,
                    org: input.org,
                    issue_type,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgIssueTypeFailure = {
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
