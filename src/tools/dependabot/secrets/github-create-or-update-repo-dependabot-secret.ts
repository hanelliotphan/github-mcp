import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";
import type { CreateOrUpdateRepoDependabotSecretSuccess, CreateOrUpdateRepoDependabotSecretFailure } from "../../../types.js";
import { encryptSecretValue } from "../../../utils/encrypt-secret.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";


const orgLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;
const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;
const enterpriseSlugRegex = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const secretNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

const DEFAULT_PER_PAGE = 100 as const;

export function registerGithubCreateOrUpdateRepoDependabotSecretTool(server: McpServer, octokit: Octokit): void {
    server.tool("github_create_or_update_repo_dependabot_secret", "Create or update repository Dependabot secret (PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}). Provide plaintext value; encrypted automatically. See [Create or update a repository secret](https://docs.github.com/en/rest/dependabot/secrets?apiVersion=2026-03-10#create-or-update-a-repository-secret).", {
        owner: z.string().min(1).max(39).regex(ownerLoginRegex, "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"),
        name: z.string().min(1).max(100).regex(repoNameRegex, "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"),
        secret_name: z.string().min(1).regex(secretNameRegex, "secret_name may only contain letters, numbers, and underscores and cannot start with a number"),
        value: z.string().describe("The plaintext secret value to encrypt and store.")
    }, async (input) => {
        try {
            const keyResponse = await octokit.rest.dependabot.getRepoPublicKey({ owner: input.owner, repo: input.name });
            const key = keyResponse.data as { key_id: string; key: string };
            const encryptedValue = await encryptSecretValue(input.value, key.key);
            const response = await octokit.rest.dependabot.createOrUpdateRepoSecret({ owner: input.owner, repo: input.name, secret_name: input.secret_name, encrypted_value: encryptedValue, key_id: key.key_id });
            const created = response.status === 201;
            return textAndData({ success: true, message: created ? "Repository Dependabot secret created successfully." : "Repository Dependabot secret updated successfully.", http_status: response.status, owner: input.owner, name: input.name, secret_name: input.secret_name, created, request_id: getRequestId(response.headers["x-github-request-id"]) } satisfies CreateOrUpdateRepoDependabotSecretSuccess);
        } catch (error: unknown) {
                const failurePayload: CreateOrUpdateRepoDependabotSecretFailure = { success: false, error: mapGitHubError(error), request_id: getRequestId((error as { response?: { headers?: Record<string, unknown> } }).response?.headers?.["x-github-request-id"]) };
                return textAndData(failurePayload);
            }
    });
}
