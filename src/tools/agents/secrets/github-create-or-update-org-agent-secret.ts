import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrUpdateOrgAgentSecretFailure,
    CreateOrUpdateOrgAgentSecretSuccess
} from "../../../types.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubCreateOrUpdateOrgAgentSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_or_update_org_agent_secret",
        "Create or update an organization GitHub agent secret (PUT /orgs/{org}/agents/secrets/{secret_name}). " +
            "Provide the plaintext **`value`**; this tool fetches the org public key and encrypts it with LibSodium for you. " +
            "**`visibility`** (`all`, `private`, or `selected`) is required; pass **`selected_repository_ids`** only when visibility is `selected`. " +
            "Classic OAuth apps and PATs need the **`admin:org`** scope (plus `repo` for private repositories). Returns HTTP **201** when created or **204** when updated. " +
            "See [Create or update an organization secret](https://docs.github.com/en/rest/agents/secrets?apiVersion=2026-03-10#create-or-update-an-organization-secret).",
        {
            org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"),
            secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
            value: z.string().describe("The plaintext secret value to encrypt and store."),
            visibility: z
                .enum(["all", "private", "selected"])
                .describe("Which organization repositories can access the secret."),
            selected_repository_ids: z
                .array(z.number().int().positive())
                .optional()
                .describe("Repository ids that can access the secret. Only used when visibility is `selected`.")
        },
        async (input) => {
            try {
                const keyResponse = await octokit.request("GET /orgs/{org}/agents/secrets/public-key", {
                    org: input.org
                });
                const key = keyResponse.data as { key_id: string; key: string };
                const encryptedValue = await encryptSecretValue(input.value, key.key);
                const response = await octokit.request("PUT /orgs/{org}/agents/secrets/{secret_name}", {
                    org: input.org,
                    secret_name: input.secret_name,
                    encrypted_value: encryptedValue,
                    key_id: key.key_id,
                    visibility: input.visibility,
                    ...(input.selected_repository_ids !== undefined
                        ? { selected_repository_ids: input.selected_repository_ids }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const created = response.status === 201;
                const successPayload: CreateOrUpdateOrgAgentSecretSuccess = {
                    success: true,
                    message: created
                        ? "Organization agent secret created successfully."
                        : "Organization agent secret updated successfully.",
                    http_status: response.status,
                    org: input.org,
                    secret_name: input.secret_name,
                    created,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrUpdateOrgAgentSecretFailure = {
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
