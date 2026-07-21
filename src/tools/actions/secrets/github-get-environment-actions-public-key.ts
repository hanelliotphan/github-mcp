import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetEnvironmentActionsPublicKeyFailure,
    GetEnvironmentActionsPublicKeySuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetEnvironmentActionsPublicKeyTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_environment_actions_public_key",
        "Get an environment's public key for encrypting GitHub Actions secrets (GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key). " +
            "Returns **`key_id`** and **`key`** (base64), which you need before creating or updating an environment secret. " +
            "Anyone with read access can call this; private repositories require the **`repo`** scope for classic tokens. " +
            "See [Get an environment public key](https://docs.github.com/en/rest/actions/secrets?apiVersion=2026-03-10#get-an-environment-public-key).",
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
            environment_name: z.string().min(1).describe("The name of the environment.")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getEnvironmentPublicKey({
                    owner: input.owner,
                    repo: input.name,
                    environment_name: input.environment_name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetEnvironmentActionsPublicKeySuccess = {
                    success: true,
                    message: "Environment public key retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    environment_name: input.environment_name,
                    public_key: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetEnvironmentActionsPublicKeyFailure = {
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
