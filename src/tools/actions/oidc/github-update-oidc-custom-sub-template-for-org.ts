import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    UpdateOidcCustomSubTemplateForOrgFailure,
    UpdateOidcCustomSubTemplateForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubUpdateOidcCustomSubTemplateForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_update_oidc_custom_sub_template_for_org",
        "Set the customization template for an OIDC subject claim for an organization (PUT /orgs/{org}/actions/oidc/customization/sub). " +
            "Provide **`include_claim_keys`** — array of claim names each org repository's OIDC subject claim should include (e.g. `repo`, `context`). " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`write:org`** scope. Success is HTTP **201**. " +
            "See [Set the customization template for an OIDC subject claim for an organization](https://docs.github.com/en/rest/actions/oidc?apiVersion=2026-03-10#set-the-customization-template-for-an-oidc-subject-claim-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            include_claim_keys: z
                .array(z.string().min(1))
                .describe("Array of claim names the OIDC subject claim should include.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.oidc.updateOidcCustomSubTemplateForOrg({
                    org: input.org,
                    include_claim_keys: input.include_claim_keys
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: UpdateOidcCustomSubTemplateForOrgSuccess = {
                    success: true,
                    message: "OIDC customization template updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    include_claim_keys: input.include_claim_keys,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: UpdateOidcCustomSubTemplateForOrgFailure = {
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
