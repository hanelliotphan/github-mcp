import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrUpdateRepoCodespacesSecretFailure,
    CreateOrUpdateRepoCodespacesSecretSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function registerGithubCreateOrUpdateRepoCodespacesSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_or_update_repo_codespaces_secret", "Create or update repository codespaces secret with encrypted value. See GitHub REST repository secrets.", { owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"), name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"), secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"), value: z.string() }, async (input) => {
        const full_name = `${input.owner}/${input.name}`;
        try {
            const keyResponse = await octokit.request("GET /repos/{owner}/{repo}/codespaces/secrets/public-key", { owner: input.owner, repo: input.name });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.request("PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}", { owner: input.owner, repo: input.name, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id });
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Repository codespaces secret created successfully." : "Repository codespaces secret updated successfully.", http_status: response.status, owner: input.owner, repo: input.name, full_name, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies CreateOrUpdateRepoCodespacesSecretSuccess);
        } catch (error: unknown) {
            return textAndData({ success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) } satisfies CreateOrUpdateRepoCodespacesSecretFailure);
        }
    });
}