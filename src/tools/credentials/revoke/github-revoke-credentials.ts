import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Octokit } from "@octokit/rest";
import { z } from "zod";

import type { RevokeCredentialsFailure, RevokeCredentialsSuccess } from "../../../types.js";
import { getRequestId, mapGitHubError } from "../../../utils/errors.js";
import { textAndData } from "../../../utils/mcp-response.js";

function toPlain(data: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(data ?? {})) as Record<string, unknown>;
}

/**
 * GitHub rejects authenticated calls to POST /credentials/revoke with 403.
 * Use a dedicated unauthenticated client for this endpoint only.
 */
function createUnauthenticatedOctokit(): Octokit {
    return new Octokit({
        headers: { "X-GitHub-Api-Version": "2026-03-10" }
    });
}

export function registerGithubRevokeCredentialsTool(server: McpServer, _octokit: Octokit): void {
    server.tool(
        "github_revoke_credentials",
        "Revoke a list of credentials (POST /credentials/revoke). Submit up to **1000** exposed tokens " +
            "(`ghp_`, `github_pat_`, `gho_`, `ghu_`, `ghr_`). Credential owners are notified; revocation is permanent. " +
            "GitHub requires this call to be **unauthenticated** — authenticated requests return **403**. " +
            "Unauthenticated rate limit: **60** requests/hour. " +
            "See [Revoke a list of credentials](https://docs.github.com/en/rest/credentials/revoke?apiVersion=2026-03-10#revoke-a-list-of-credentials).",
        {
            credentials: z
                .array(z.string().min(1))
                .min(1)
                .max(1000)
                .describe("Credentials to revoke (max 1000).")
        },
        async (input) => {
            try {
                const unauth = createUnauthenticatedOctokit();
                const response = await unauth.rest.credentials.revoke({
                    credentials: input.credentials
                });
                const requestId = getRequestId(response.headers["x-github-request-id"]);
                const successPayload: RevokeCredentialsSuccess = {
                    success: true,
                    message: "Credential revocation accepted.",
                    http_status: response.status as number,
                    credentials_count: input.credentials.length,
                    result: toPlain(response.data),
                    request_id: requestId
                };
                return textAndData(successPayload);
            } catch (error: unknown) {
                const failurePayload: RevokeCredentialsFailure = {
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
