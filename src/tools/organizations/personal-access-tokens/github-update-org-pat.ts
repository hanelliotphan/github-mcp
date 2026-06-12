import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateOrgPatFailure,
    UpdateOrgPatSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubUpdateOrgPatTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_pat",
        "Update **one** org member’s access to org resources via a **fine-grained personal access token** (POST /orgs/{org}/personal-access-tokens/{pat_id}). " +
            "Limited to **revoking** existing access (`action`: `revoke`). " +
            "**Only GitHub Apps can use this endpoint.** " +
            "Success is HTTP **204** No Content. **403**, **404**, **422**, **500** on errors. " +
            "To revoke **multiple** tokens, use **`github_update_org_pats`**. " +
            "See [Update the access a fine-grained personal access token has to organization resources](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#update-the-access-a-fine-grained-personal-access-token-has-to-organization-resources).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            pat_id: z
                .number()
                .int()
                .positive()
                .describe("Unique identifier of the fine-grained personal access token."),
            action: z
                .enum(["revoke"])
                .describe("Action to apply. Only `revoke` is supported.")
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /orgs/{org}/personal-access-tokens/{pat_id}", {
                    org: input.org,
                    pat_id: input.pat_id,
                    action: input.action
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOrgPatSuccess = {
                    success: true,
                    message: "Organization PAT access revoked successfully.",
                    http_status: response.status,
                    org: input.org,
                    pat_id: input.pat_id,
                    action: input.action,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgPatFailure = {
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
