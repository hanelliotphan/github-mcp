import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Octokit } from "@octokit/rest";
import { z } from "zod";

import type {
    GetCustomOidcSubClaimForRepoFailure,
    GetCustomOidcSubClaimForRepoSuccess
} from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

const repoNameRegex = /^(?![.-])[A-Za-z0-9._-]{1,100}(?<![.-])$/;

const ownerLoginRegex = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9-]*[A-Za-z0-9])){0,38}$/;

export function registerGithubGetCustomOidcSubClaimForRepoTool(server: McpServer, octokit: Octokit): void {
    server.tool(
        "github_get_custom_oidc_sub_claim_for_repo",
        "Get the customization template for an OIDC subject claim for a repository (GET /repos/{owner}/{repo}/actions/oidc/customization/sub). " +
            "Returns `use_default` and, when customized, `include_claim_keys`. " +
            "The authenticated user must have **admin** access to the repository. Classic OAuth apps and PATs need the **`repo`** scope. " +
            "See [Get the customization template for an OIDC subject claim for a repository](https://docs.github.com/en/rest/actions/oidc?apiVersion=2026-03-10#get-the-customization-template-for-an-oidc-subject-claim-for-a-repository).",
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
                )
        },
        async (input) => {
            const full_name = `${input.owner}/${input.name}`;
            try {
                const response = await octokit.rest.actions.getCustomOidcSubClaimForRepo({
                    owner: input.owner,
                    repo: input.name
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: GetCustomOidcSubClaimForRepoSuccess = {
                    success: true,
                    message: "OIDC subject claim customization retrieved successfully.",
                    http_status: response.status,
                    owner: input.owner,
                    repo: input.name,
                    full_name,
                    claim: JSON.parse(JSON.stringify(response.data)) as Record<string, unknown>,
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: GetCustomOidcSubClaimForRepoFailure = {
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
