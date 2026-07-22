import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrUpdateOrgCodespacesSecretFailure,
    CreateOrUpdateOrgCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";

const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubCreateOrUpdateOrgCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_or_update_org_codespaces_secret", "Create or update organization codespaces secret (PUT /orgs/{org}/codespaces/secrets/{secret_name}). Plaintext value, visibility all|private|selected. See GitHub REST organization secrets.", {
        org: z
                .string()
                .min(1)
                .max(39)
                .regex(orgLoginRegex, "org must be a valid organization login (1–39 chars, alphanumeric and hyphens)"), secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        value: z.string().describe("The plaintext secret value to encrypt and store."),
        visibility: z.enum(["all", "private", "selected"]),
        selected_repository_ids: z.array(z.number().int().positive()).optional()
    }, async (input) => {
        try {
            const keyResponse = await octokit.request("GET /orgs/{org}/codespaces/secrets/public-key", { org: input.org });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.request("PUT /orgs/{org}/codespaces/secrets/{secret_name}", {
                org: input.org, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id,
                visibility: input.visibility,
                ...(input.selected_repository_ids !== undefined ? { selected_repository_ids: input.selected_repository_ids } : {})
            });
            const requestId = getRequestId(response.headers["x-github-request-id"]);
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Organization codespaces secret created successfully." : "Organization codespaces secret updated successfully.", http_status: response.status, org: input.org, secret_name: input.secret_name, created, request_id: requestId } satisfies CreateOrUpdateOrgCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies CreateOrUpdateOrgCodespacesSecretFailure);
        }
    });
}