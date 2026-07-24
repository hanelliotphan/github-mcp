import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgPrivateRegistriesPublicKeyFailure,
    GetOrgPrivateRegistriesPublicKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgPrivateRegistriesPublicKeyTool(
    server: McpServer,
    octokit: Octokit
): void {
    server.tool(
        "github_get_org_private_registries_public_key",
        "Get the public key for encrypting organization private-registry secrets (GET /orgs/{org}/private-registries/public-key). " +
            "Requires **`admin:org`**. Use before create/update when passing encrypted values, or pass plaintext **`value`** on those tools to encrypt automatically. " +
            "See [Get private registries public key for an organization](https://docs.github.com/en/rest/private-registries/organization-configurations?apiVersion=2026-03-10#get-private-registries-public-key-for-an-organization).",
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
                const response = await octokit.rest.privateRegistries.getOrgPublicKey({
                    org: input.org
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgPrivateRegistriesPublicKeySuccess = {
                    success: true,
                    message: "Private registries public key retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    public_key: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgPrivateRegistriesPublicKeyFailure = {
                    success: false,
                    error: mapGitHubError(error),
                    request_id: getRequestId(
                        (error as { response?: { headers?: Record<string, unknown> } }).response
                            ?.headers?.["x-github-request-id"]
                    )
                };
                return textAndData(failurePayload);
            }
        }
    );
}
