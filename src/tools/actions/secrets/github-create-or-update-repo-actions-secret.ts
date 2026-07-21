import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    CreateOrUpdateRepoActionsSecretFailure,
    CreateOrUpdateRepoActionsSecretSuccess
} from "../../../types.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function registerGithubCreateOrUpdateRepoActionsSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_create_or_update_repo_actions_secret",
        "Create or update a repository GitHub Actions secret (PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}). " +
            "Provide the plaintext **`value`**; this tool fetches the repository public key and encrypts it with LibSodium for you. " +
            "The authenticated user must have collaborator access; classic OAuth apps and PATs need the **`repo`** scope. Returns HTTP **201** when created or **204** when updated. " +
            "See [Create or update a repository secret](https://docs.github.com/en/rest/actions/secrets?apiVersion=2026-03-10#create-or-update-a-repository-secret).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
            secret_name: z
                .string()
                .min(1)
                .regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
            value: z.string().describe("The plaintext secret value to encrypt and store.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const keyResponse = await octokit.rest.actions.getRepoPublicKey({
                    owner: input.owner,
                    repo: input.name
                });
                const key = keyResponse.data as { key_id: string; key: string };
                const encryptedValue = await encryptSecretValue(input.value, key.key);
                const response = await octokit.rest.actions.createOrUpdateRepoSecret({
                    owner: input.owner,
                    repo: input.name,
                    secret_name: input.secret_name,
                    encrypted_value: encryptedValue,
                    key_id: key.key_id
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const created = response.status === 201;
                const successPayload: CreateOrUpdateRepoActionsSecretSuccess = {
                    success: true,
                    message: created
                        ? "Repository secret created successfully."
                        : "Repository secret updated successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    secret_name: input.secret_name,
                    created,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: CreateOrUpdateRepoActionsSecretFailure = {
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
