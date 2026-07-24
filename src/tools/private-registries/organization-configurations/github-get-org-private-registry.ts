import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetOrgPrivateRegistryFailure,
    GetOrgPrivateRegistrySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

export function registerGithubGetOrgPrivateRegistryTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_org_private_registry",
        "Get one organization private registry configuration (GET /orgs/{org}/private-registries/{secret_name}). " +
            "Omits the encrypted secret value. Requires **`admin:org`**. " +
            "See [Get a private registry for an organization](https://docs.github.com/en/rest/private-registries/organization-configurations?apiVersion=2026-03-10#get-a-private-registry-for-an-organization).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    orgLoginRegex,
                    "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            secret_name: z.string().min(1).describe("Name of the private registry configuration.")
        },
        async (input) => {
            try {
                const response = await octokit.rest.privateRegistries.getOrgPrivateRegistry({
                    org: input.org,
                    secret_name: input.secret_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetOrgPrivateRegistrySuccess = {
                    success: true,
                    message: "Private registry retrieved successfully.",
                    http_status: response.status as number,
                    org: input.org,
                    secret_name: input.secret_name,
                    registry: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetOrgPrivateRegistryFailure = {
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
