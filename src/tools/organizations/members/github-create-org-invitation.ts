import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrgInvitationFailure,
    CreateOrgInvitationSuccess,
    OrgFailedInvitationRow
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const createOrgInvitationRoleSchema = z.enum([
    "admin",
    "direct_member",
    "billing_manager",
    "reinstate"
]);

const createOrgInvitationInputSchema = z
    .object({
        org: z
            .string()
            .min(1)
            .max(39)
            .regex(
                orgLoginRegex,
                "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
            ),
        invitee_id: z.number().int().positive().optional(),
        email: z.string().min(1).optional(),
        role: createOrgInvitationRoleSchema.optional(),
        team_ids: z.array(z.number().int()).optional()
    })
    .strict()
    .superRefine((data, ctx) => {
        const hasId = data.invitee_id != null;
        const hasEmail = data.email != null && data.email.trim().length > 0;
        if (!hasId && !hasEmail) {
            ctx.addIssue({
                code: "custom",
                message: "Provide exactly one of invitee_id (GitHub user id) or email.",
                path: ["invitee_id"]
            });
        }
        if (hasId && hasEmail) {
            ctx.addIssue({
                code: "custom",
                message: "Provide only one of invitee_id or email, not both.",
                path: ["email"]
            });
        }
    });

function toPlainInvitation(data: unknown): OrgFailedInvitationRow {
    return JSON.parse(JSON.stringify(data)) as OrgFailedInvitationRow;
}

export function registerGithubCreateOrgInvitationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_org_invitation",
        "Create an **organization invitation** (POST /orgs/{org}/invitations). " +
            "Requires exactly one of **`invitee_id`** (numeric GitHub user id) or **`email`**. " +
            "Optional **`role`**: `direct_member` (GitHub default when omitted), `admin`, `billing_manager`, or **`reinstate`** (restores prior role for a former member). " +
            "Optional **`team_ids`**: numeric team ids to add the invitee to. " +
            "Caller must be an **organization owner**; sends email notifications; watch rate limits. " +
            "**201** on success; **404**, **422** on errors. " +
            "See [Create an organization invitation](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#create-an-organization-invitation).",
        {
            org: createOrgInvitationInputSchema.shape.org,
            invitee_id: createOrgInvitationInputSchema.shape.invitee_id,
            email: createOrgInvitationInputSchema.shape.email,
            role: createOrgInvitationInputSchema.shape.role,
            team_ids: createOrgInvitationInputSchema.shape.team_ids
        },
        async (rawInput) => {
            const parsed = createOrgInvitationInputSchema.safeParse(rawInput);
            if (!parsed.success) {
                const failurePayload: CreateOrgInvitationFailure = {
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
                    invitee_id?: number;
                    email?: string;
                    role?: z.infer<typeof createOrgInvitationRoleSchema>;
                    team_ids?: number[];
                } = {};
                if (input.invitee_id != null) {
                    body.invitee_id = input.invitee_id;
                }
                if (input.email != null && input.email.trim().length > 0) {
                    body.email = input.email.trim();
                }
                if (input.role !== undefined) {
                    body.role = input.role;
                }
                if (input.team_ids != null && input.team_ids.length > 0) {
                    body.team_ids = input.team_ids;
                }

                const response = await octokit.request("POST /orgs/{org}/invitations", {
                    org: input.org,
                    ...body
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const invitation = toPlainInvitation(response.data);
                const successPayload: CreateOrgInvitationSuccess = {
                    success: true,
                    message: "Organization invitation created successfully.",
                    http_status: response.status,
                    org: input.org,
                    invitation,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrgInvitationFailure = {
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
