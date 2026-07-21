import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgActionsPublicKeyFailure,
    GetOrgActionsPublicKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetOrgActionsPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_actions_public_key",
        "Get an organization's public key for encrypting GitHub Actions secrets (GET /orgs/{org}/actions/secrets/public-key). " +
            "Returns **`key_id`** and **`key`** (base64), which you need before creating or updating a secret. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). " +
            "See [Get an organization public key](https://docs.github.com/en/rest/actions/secrets?apiVersion=2026-03-10#get-an-organization-public-key).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)")
        },
        async (input) => {
            try {
                const response = await octokit.rest.actions.getOrgPublicKey({ org: input.org });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgActionsPublicKeySuccess = {
                    success: true,
                    message: "Organization public key retrieved successfully.",
                    http_status: response.status,
                    org: input.org,
                    public_key: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgActionsPublicKeyFailure = {
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
