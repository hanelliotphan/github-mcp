import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOidcCustomSubTemplateForOrgFailure,
    GetOidcCustomSubTemplateForOrgSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetOidcCustomSubTemplateForOrgTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_oidc_custom_sub_template_for_org",
        "Get the customization template for an OIDC subject claim for an organization (GET /orgs/{org}/actions/oidc/customization/sub). " +
            "Returns the template (`include_claim_keys`). " +
            "The authenticated user must be an **organization owner**. Classic OAuth apps and PATs need the **`read:org`** scope. " +
            "See [Get the customization template for an OIDC subject claim for an organization](https://docs.github.com/en/rest/actions/oidc?apiVersion=2026-03-10#get-the-customization-template-for-an-oidc-subject-claim-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                )
        },
        async (input) => {
            try {
                const response = await octokit.rest.oidc.getOidcCustomSubTemplateForOrg({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOidcCustomSubTemplateForOrgSuccess = {
                    success: true,
                    message: "OIDC customization template retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    template: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOidcCustomSubTemplateForOrgFailure = {
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
