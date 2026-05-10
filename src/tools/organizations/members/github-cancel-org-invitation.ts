import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { CancelOrgInvitationFailure, CancelOrgInvitationSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubCancelOrgInvitationTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_cancel_org_invitation",
        "Cancel a **pending organization invitation** (DELETE /orgs/{org}/invitations/{invitation_id}). " +
            "Success is HTTP **204** No Content. Triggers notifications. " +
            "Caller must be an **organization owner**; classic tokens typically need **`admin:org`**. **404**, **422** on errors. " +
            "See [Cancel an organization invitation](https://docs.github.com/en/rest/orgs/members?apiVersion=2026-03-10#cancel-an-organization-invitation).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            invitation_id: z
                .number()
                .int()
                .positive()
                .describe("Numeric id of the pending invitation (from list pending invitations).")
        },
        async (input) => {
            try {
                const response = await octokit.request("DELETE /orgs/{org}/invitations/{invitation_id}", {
                    org: input.org,
                    invitation_id: input.invitation_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: CancelOrgInvitationSuccess = {
                    success: true,
                    message: "Organization invitation canceled successfully.",
                    http_status: response.status,
                    org: input.org,
                    invitation_id: input.invitation_id,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CancelOrgInvitationFailure = {
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
