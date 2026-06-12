import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateOrgPatsFailure,
    UpdateOrgPatsSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlainData(data: unknown): Record<string, unknown> | undefined {
    if (data === null || data === undefined || data === "") {
        return undefined;
    }
    if (typeof data === "object" && Object.keys(data as object).length === 0) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

export function registerGithubUpdateOrgPatsTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_org_pats",
        "Update org members’ access to org resources via **fine-grained personal access tokens** (POST /orgs/{org}/personal-access-tokens). " +
            "Limited to **revoking** existing access (`action`: `revoke`). " +
            "**Only GitHub Apps can use this endpoint.** " +
            "Provide **`pat_ids`** (token ids from **`github_list_org_pats`**). " +
            "**202** Accepted when revocation is queued; **403**, **404**, **422**, **500** on errors. " +
            "To revoke **one** token, use the single-token endpoint (`POST /orgs/{org}/personal-access-tokens/{pat_id}`). " +
            "See [Update the access to organization resources via fine-grained personal access tokens](https://docs.github.com/en/rest/orgs/personal-access-tokens?apiVersion=2026-03-10#update-the-access-to-organization-resources-via-fine-grained-personal-access-tokens).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            action: z
                .enum(["revoke"])
                .describe("Action to apply. Only `revoke` is supported."),
            pat_ids: z
                .array(z.number().int().positive())
                .min(1)
                .describe("IDs of the fine-grained personal access tokens to revoke.")
        },
        async (input) => {
            try {
                const response = await octokit.request("POST /orgs/{org}/personal-access-tokens", {
                    org: input.org,
                    action: input.action,
                    pat_ids: input.pat_ids
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const data = toPlainData(response.data);
                const successPayload: UpdateOrgPatsSuccess = {
                    success: true,
                    message: "Organization PAT revocation accepted (202; processed asynchronously).",
                    http_status: response.status,
                    org: input.org,
                    action: input.action,
                    pat_ids: input.pat_ids,
                    ...(data ? { data } : {}),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOrgPatsFailure = {
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
