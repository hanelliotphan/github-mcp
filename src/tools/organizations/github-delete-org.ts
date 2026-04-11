import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { DeleteOrgFailure, DeleteOrgSuccess } from "../../types.js";
import { getRequestId, mapGitHubError } from "../../utils/errors.js";
import { textAndData } from "../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubDeleteOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_delete_org",
        "Delete an organization (DELETE /orgs/{org}). " +
            "Removes the **organization and all its repositories**; the login stays unavailable for **90 days**. " +
            "Review GitHub’s [Terms of Service](https://docs.github.com/site-policy/github-terms/github-terms-of-service) before using this. " +
            "Success is typically HTTP **202** Accepted. " +
            "Live deletes require **`confirm`: true** unless **`dry_run`: true**. " +
            "Requires org owner access; classic tokens need **`admin:org`** or as GitHub documents. " +
            "See [Delete an organization](https://docs.github.com/en/rest/orgs/orgs?apiVersion=2026-03-10#delete-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            dry_run: z.boolean().optional().default(false),
            confirm: z.boolean().optional().default(false)
        },
        async (input) => {
            const planned = { org: input.org };

            if (input.dry_run) {
                const dryRunPayload: DeleteOrgSuccess = {
                    success: true,
                    message: "Dry run successful. Organization was not deleted.",
                    org: input.org,
                    request_id: null,
                    dry_run: true,
                    planned_request: planned
                };
                return textAndData(dryRunPayload);
            }

            if (!input.confirm) {
                const guardFailure: DeleteOrgFailure = {
                    success: false,
                    error: {
                        status_code: 400,
                        error_type: "validation_error",
                        message:
                            "Refusing to delete: set confirm to true after verifying the org login, or use dry_run: true to preview.",
                        hint: "Example: same arguments with confirm: true to execute DELETE.",
                        retryable: false
                    },
                    request_id: null
                };
                return textAndData(guardFailure);
            }

            try {
                const response = await octokit.rest.orgs.delete({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);

                const successPayload: DeleteOrgSuccess = {
                    success: true,
                    message: "Organization deletion accepted.",
                    http_status: response.status,
                    org: input.org,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: DeleteOrgFailure = {
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
