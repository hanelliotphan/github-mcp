import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    SetCustomOidcSubClaimForRepoFailure,
    SetCustomOidcSubClaimForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubSetCustomOidcSubClaimForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_set_custom_oidc_sub_claim_for_repo",
        "Set the customization template for an OIDC subject claim for a repository (PUT /repos/{owner}/{repo}/actions/oidc/customization/sub). " +
            "Set **`use_default`** to `true` to use GitHub's default subject claim, or `false` and provide **`include_claim_keys`** (array of claim names) for a custom template. " +
            "The authenticated user must have **admin** access to the repository. Classic OAuth apps and PATs need the **`repo`** scope. Success is HTTP **201**. " +
            "See [Set the customization template for an OIDC subject claim for a repository](https://docs.github.com/en/rest/actions/oidc?apiVersion=2026-03-10#set-the-customization-template-for-an-oidc-subject-claim-for-a-repository).",
        {
            owner: z
                .string()
                .min(1)
                .max(39)
                .regex(
                    ownerLoginRegex,
                    "owner must be a valid user or organization login (1–39 chars, alphanumeric and hyphens)"
                ),
            name: z
                .string()
                .min(1)
                .max(100)
                .regex(
                    repoNameRegex,
                    "name must be 1-100 chars and contain only letters, numbers, '.', '_' or '-'"
                ),
            use_default: z
                .boolean()
                .describe("Whether to use the default template. Set false to provide include_claim_keys."),
            include_claim_keys: z
                .array(z.string().min(1))
                .optional()
                .describe("Array of claim names for the custom template (required when use_default is false).")
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.setCustomOidcSubClaimForRepo({
                    owner: input.owner,
                    repo: input.name,
                    use_default: input.use_default,
                    ...(input.include_claim_keys !== undefined
                        ? { include_claim_keys: input.include_claim_keys }
                        : {})
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: SetCustomOidcSubClaimForRepoSuccess = {
                    success: true,
                    message: "OIDC subject claim customization set successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    use_default: input.use_default,
                    include_claim_keys: input.include_claim_keys ?? null,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: SetCustomOidcSubClaimForRepoFailure = {
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
